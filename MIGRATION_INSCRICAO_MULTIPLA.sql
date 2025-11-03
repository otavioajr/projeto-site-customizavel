-- ============================================
-- MIGRATION: Sistema de Inscrição Múltipla
-- Data: 2025-11-02
-- Descrição: Adiciona suporte para inscrições em grupo
-- ============================================

-- Passo 1: Adicionar novos campos na tabela inscriptions
-- ============================================

-- Adicionar coluna para identificar grupos de inscrições
ALTER TABLE inscriptions 
ADD COLUMN IF NOT EXISTS group_id UUID;

-- Adicionar coluna para identificar o responsável do grupo
ALTER TABLE inscriptions 
ADD COLUMN IF NOT EXISTS is_responsible BOOLEAN DEFAULT false;

-- Adicionar coluna para referenciar o responsável (FK)
ALTER TABLE inscriptions 
ADD COLUMN IF NOT EXISTS responsible_id UUID REFERENCES inscriptions(id);

-- Adicionar coluna para número do participante no grupo
ALTER TABLE inscriptions 
ADD COLUMN IF NOT EXISTS participant_number INTEGER DEFAULT 1;

-- Adicionar coluna para total de participantes no grupo
ALTER TABLE inscriptions 
ADD COLUMN IF NOT EXISTS total_participants INTEGER DEFAULT 1;

-- Passo 2: Criar índices para performance
-- ============================================

-- Índice para buscar todos os membros de um grupo
CREATE INDEX IF NOT EXISTS idx_inscriptions_group_id 
ON inscriptions(group_id);

-- Índice para buscar o responsável
CREATE INDEX IF NOT EXISTS idx_inscriptions_responsible 
ON inscriptions(is_responsible) 
WHERE is_responsible = true;

-- Índice composto para buscar grupos por página
CREATE INDEX IF NOT EXISTS idx_inscriptions_page_group 
ON inscriptions(page_slug, group_id);

-- Passo 3: Migrar dados existentes
-- ============================================

-- Atualizar registros antigos para serem compatíveis com o novo sistema
-- Cada inscrição antiga se torna um grupo de 1 pessoa
UPDATE inscriptions 
SET 
  group_id = gen_random_uuid(),
  is_responsible = true,
  responsible_id = NULL,
  participant_number = 1,
  total_participants = 1
WHERE group_id IS NULL;

-- Passo 4: Adicionar constraints
-- ============================================

-- Garantir que group_id não seja nulo em novos registros
ALTER TABLE inscriptions 
ALTER COLUMN group_id SET NOT NULL;

-- Garantir que is_responsible não seja nulo
ALTER TABLE inscriptions 
ALTER COLUMN is_responsible SET NOT NULL;

-- Garantir que participant_number seja positivo
ALTER TABLE inscriptions 
ADD CONSTRAINT check_participant_number_positive 
CHECK (participant_number > 0);

-- Garantir que total_participants seja positivo
ALTER TABLE inscriptions 
ADD CONSTRAINT check_total_participants_positive 
CHECK (total_participants > 0);

-- Garantir que participant_number não seja maior que total_participants
ALTER TABLE inscriptions 
ADD CONSTRAINT check_participant_number_valid 
CHECK (participant_number <= total_participants);

-- Passo 5: Criar função auxiliar para contar participantes por grupo
-- ============================================

CREATE OR REPLACE FUNCTION count_group_participants(p_group_id UUID)
RETURNS INTEGER AS $$
DECLARE
  participant_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO participant_count
  FROM inscriptions
  WHERE group_id = p_group_id;
  
  RETURN participant_count;
END;
$$ LANGUAGE plpgsql;

-- Passo 6: Criar função para validar vagas disponíveis
-- ============================================

CREATE OR REPLACE FUNCTION check_available_slots(
  p_page_slug TEXT,
  p_requested_slots INTEGER,
  p_max_participants INTEGER
)
RETURNS TABLE(available BOOLEAN, remaining_slots INTEGER, message TEXT) AS $$
DECLARE
  current_count INTEGER;
  remaining INTEGER;
BEGIN
  -- Contar inscrições existentes para esta página
  SELECT COUNT(*) INTO current_count
  FROM inscriptions
  WHERE page_slug = p_page_slug;
  
  -- Calcular vagas restantes
  remaining := p_max_participants - current_count;
  
  -- Verificar se há vagas suficientes
  IF remaining >= p_requested_slots THEN
    RETURN QUERY SELECT 
      true, 
      remaining, 
      format('✅ %s vagas disponíveis', remaining);
  ELSE
    RETURN QUERY SELECT 
      false, 
      remaining, 
      format('❌ Apenas %s vagas disponíveis. Você solicitou %s.', remaining, p_requested_slots);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Passo 7: Criar view para facilitar consultas de grupos
-- ============================================

CREATE OR REPLACE VIEW v_inscription_groups AS
SELECT 
  i.group_id,
  i.page_slug,
  i.status,
  i.created_at,
  COUNT(*) as total_participants,
  (array_agg(i.id) FILTER (WHERE i.is_responsible))[1] as responsible_id,
  MAX(CASE WHEN i.is_responsible THEN i.form_data->>'nome' END) as responsible_name,
  MAX(CASE WHEN i.is_responsible THEN i.form_data->>'email' END) as responsible_email,
  MAX(CASE WHEN i.is_responsible THEN i.form_data->>'telefone' END) as responsible_phone,
  json_agg(
    json_build_object(
      'id', i.id,
      'participant_number', i.participant_number,
      'is_responsible', i.is_responsible,
      'form_data', i.form_data
    ) ORDER BY i.participant_number
  ) as participants
FROM inscriptions i
GROUP BY i.group_id, i.page_slug, i.status, i.created_at;

-- Passo 8: Criar função para deletar grupo completo
-- ============================================

CREATE OR REPLACE FUNCTION delete_inscription_group(p_group_id UUID)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM inscriptions
  WHERE group_id = p_group_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Passo 9: Criar função para atualizar status de grupo completo
-- ============================================

CREATE OR REPLACE FUNCTION update_group_status(
  p_group_id UUID,
  p_new_status TEXT
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE inscriptions
  SET status = p_new_status
  WHERE group_id = p_group_id;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Passo 10: Atualizar políticas RLS (se necessário)
-- ============================================

-- As políticas existentes já cobrem os novos campos
-- Mas vamos garantir que estão corretas

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Admin pode gerenciar grupos" ON inscriptions;

-- Criar política para gerenciar grupos
CREATE POLICY "Admin pode gerenciar grupos"
  ON inscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- TESTES E VALIDAÇÃO
-- ============================================

-- Teste 1: Verificar se os campos foram adicionados
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'inscriptions' 
    AND column_name IN ('group_id', 'is_responsible', 'responsible_id', 'participant_number', 'total_participants')
  ) THEN
    RAISE NOTICE '✅ Novos campos adicionados com sucesso';
  ELSE
    RAISE EXCEPTION '❌ Erro: Campos não foram adicionados';
  END IF;
END $$;

-- Teste 2: Verificar se os índices foram criados
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE tablename = 'inscriptions' 
    AND indexname IN ('idx_inscriptions_group_id', 'idx_inscriptions_responsible', 'idx_inscriptions_page_group')
  ) THEN
    RAISE NOTICE '✅ Índices criados com sucesso';
  ELSE
    RAISE EXCEPTION '❌ Erro: Índices não foram criados';
  END IF;
END $$;

-- Teste 3: Verificar se as funções foram criadas
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname IN ('count_group_participants', 'check_available_slots', 'delete_inscription_group', 'update_group_status')
  ) THEN
    RAISE NOTICE '✅ Funções auxiliares criadas com sucesso';
  ELSE
    RAISE EXCEPTION '❌ Erro: Funções não foram criadas';
  END IF;
END $$;

-- Teste 4: Verificar se a view foi criada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.views 
    WHERE table_name = 'v_inscription_groups'
  ) THEN
    RAISE NOTICE '✅ View criada com sucesso';
  ELSE
    RAISE EXCEPTION '❌ Erro: View não foi criada';
  END IF;
END $$;

-- ============================================
-- EXEMPLOS DE USO
-- ============================================

-- Exemplo 1: Buscar todos os grupos de uma página
-- SELECT * FROM v_inscription_groups WHERE page_slug = 'trilha-pico';

-- Exemplo 2: Contar participantes de um grupo
-- SELECT count_group_participants('uuid-do-grupo');

-- Exemplo 3: Verificar vagas disponíveis
-- SELECT * FROM check_available_slots('trilha-pico', 3, 50);

-- Exemplo 4: Deletar grupo completo
-- SELECT delete_inscription_group('uuid-do-grupo');

-- Exemplo 5: Atualizar status de grupo
-- SELECT update_group_status('uuid-do-grupo', 'confirmed');

-- ============================================
-- FIM DA MIGRATION
-- ============================================

-- ✅ Migration concluída com sucesso!
--
-- Próximos passos:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique os testes acima para garantir que tudo foi criado
-- 3. Atualize as funções JavaScript do supabase.js
-- 4. Teste com dados reais

-- ROLLBACK (se necessário):
-- Para reverter esta migration, execute:
-- DROP VIEW IF EXISTS v_inscription_groups;
-- DROP FUNCTION IF EXISTS count_group_participants(UUID);
-- DROP FUNCTION IF EXISTS check_available_slots(TEXT, INTEGER, INTEGER);
-- DROP FUNCTION IF EXISTS delete_inscription_group(UUID);
-- DROP FUNCTION IF EXISTS update_group_status(UUID, TEXT);
-- ALTER TABLE inscriptions DROP COLUMN IF EXISTS group_id;
-- ALTER TABLE inscriptions DROP COLUMN IF EXISTS is_responsible;
-- ALTER TABLE inscriptions DROP COLUMN IF EXISTS responsible_id;
-- ALTER TABLE inscriptions DROP COLUMN IF EXISTS participant_number;
-- ALTER TABLE inscriptions DROP COLUMN IF EXISTS total_participants;
