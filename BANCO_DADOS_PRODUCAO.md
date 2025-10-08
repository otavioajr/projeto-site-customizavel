# Estrutura do Banco de Dados - Produção (Supabase)

## 📊 Visão Geral

Em produção com Supabase, o sistema utilizará **uma única tabela** para todas as inscrições de todas as páginas, com identificação por `page_slug`.

---

## 🗄️ Tabelas

### 1. Tabela `inscriptions`

**Uma tabela para TODAS as inscrições de TODAS as páginas**

```sql
CREATE TABLE inscriptions (
  id BIGSERIAL PRIMARY KEY,
  page_slug TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_inscriptions_page_slug ON inscriptions(page_slug);
CREATE INDEX idx_inscriptions_status ON inscriptions(status);
CREATE INDEX idx_inscriptions_created_at ON inscriptions(created_at DESC);

-- Índice composto para queries comuns
CREATE INDEX idx_inscriptions_page_status ON inscriptions(page_slug, status);
```

#### Campos:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | BIGSERIAL | ID único da inscrição (auto-incremento) |
| `page_slug` | TEXT | Identificador da página (ex: "inscricao-climbing") |
| `data` | JSONB | Todos os dados do formulário em formato JSON |
| `status` | TEXT | Status: 'pending' ou 'confirmed' |
| `created_at` | TIMESTAMPTZ | Data/hora de criação |
| `updated_at` | TIMESTAMPTZ | Data/hora da última atualização |

#### Exemplo de registro:

```json
{
  "id": 1,
  "page_slug": "inscricao-climbing",
  "data": {
    "Nome do Aluno": "João Silva",
    "Nome do Responsável": "Maria Silva",
    "Email": "maria@email.com",
    "Telefone/WhatsApp": "(11) 98765-4321",
    "Data de Nascimento do Aluno": "2010-05-15",
    "Tamanho da Camiseta": "M",
    "Experiência em Escalada": "Iniciante",
    "Restrições Alimentares": ["Nenhuma"],
    "Observações": "Primeira vez em escalada",
    "Termos": "Sim"
  },
  "status": "pending",
  "created_at": "2025-10-08T08:39:42.000Z",
  "updated_at": "2025-10-08T08:39:42.000Z"
}
```

---

## 🔍 Queries Comuns

### Listar inscrições de uma página específica

```sql
SELECT * FROM inscriptions
WHERE page_slug = 'inscricao-climbing'
ORDER BY created_at DESC;
```

### Contar inscrições por status de uma página

```sql
SELECT 
  status,
  COUNT(*) as total
FROM inscriptions
WHERE page_slug = 'inscricao-climbing'
GROUP BY status;
```

### Buscar por nome (dentro do JSONB)

```sql
SELECT * FROM inscriptions
WHERE page_slug = 'inscricao-climbing'
  AND data->>'Nome do Aluno' ILIKE '%João%'
ORDER BY created_at DESC;
```

### Estatísticas gerais de uma página

```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmadas,
  COUNT(*) FILTER (WHERE status = 'pending') as pendentes
FROM inscriptions
WHERE page_slug = 'inscricao-climbing';
```

### Listar todas as páginas com contagem

```sql
SELECT 
  page_slug,
  COUNT(*) as total_inscricoes,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmadas,
  COUNT(*) FILTER (WHERE status = 'pending') as pendentes
FROM inscriptions
GROUP BY page_slug
ORDER BY total_inscricoes DESC;
```

---

## 🔐 Row Level Security (RLS)

### Políticas de Segurança

```sql
-- Habilitar RLS
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (para admin autenticado)
CREATE POLICY "Admin pode ver todas inscrições"
ON inscriptions FOR SELECT
TO authenticated
USING (true);

-- Permitir inserção pública (formulário público)
CREATE POLICY "Qualquer um pode criar inscrição"
ON inscriptions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Apenas admin pode atualizar
CREATE POLICY "Admin pode atualizar inscrições"
ON inscriptions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Apenas admin pode deletar
CREATE POLICY "Admin pode deletar inscrições"
ON inscriptions FOR DELETE
TO authenticated
USING (true);
```

---

## 🔄 Triggers

### Auto-atualizar `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inscriptions_updated_at
BEFORE UPDATE ON inscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 📈 Vantagens desta Estrutura

### ✅ Uma Única Tabela

**Por que não uma tabela por página?**

1. **Escalabilidade**: Fácil adicionar novas páginas sem criar tabelas
2. **Manutenção**: Uma única estrutura para gerenciar
3. **Queries flexíveis**: Pode consultar dados de múltiplas páginas
4. **Backup simplificado**: Uma tabela para fazer backup
5. **Migração fácil**: Dados centralizados
6. **Relatórios**: Pode gerar relatórios consolidados

### ✅ JSONB para Dados Dinâmicos

**Por que JSONB e não colunas fixas?**

1. **Flexibilidade**: Cada página pode ter campos diferentes
2. **Sem migrations**: Adicionar campos não requer ALTER TABLE
3. **Performance**: JSONB é indexável e rápido
4. **Validação**: Feita no frontend, não no banco
5. **Histórico**: Mantém estrutura original mesmo se formulário mudar

---

## 🔄 Migração de localStorage para Supabase

### Script de Migração

```javascript
async function migrateLocalStorageToSupabase() {
  const inscriptions = JSON.parse(localStorage.getItem('inscriptions') || '{}');
  
  const allInscriptions = [];
  
  Object.keys(inscriptions).forEach(pageSlug => {
    inscriptions[pageSlug].forEach(inscription => {
      allInscriptions.push({
        page_slug: pageSlug,
        data: inscription.data,
        status: inscription.status || 'pending',
        created_at: inscription.timestamp
      });
    });
  });
  
  // Inserir no Supabase
  const { data, error } = await supabase
    .from('inscriptions')
    .insert(allInscriptions);
  
  if (error) {
    console.error('Erro na migração:', error);
  } else {
    console.log(`${allInscriptions.length} inscrições migradas com sucesso!`);
  }
}
```

---

## 📊 Exemplo de Integração no Código

### Carregar Inscrições (substituir `loadInscriptions()`)

```javascript
async function loadInscriptions(pageSlug) {
  const { data, error } = await supabase
    .from('inscriptions')
    .select('*')
    .eq('page_slug', pageSlug)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erro ao carregar inscrições:', error);
    return [];
  }
  
  return data;
}
```

### Salvar Inscrição (substituir `saveInscription()`)

```javascript
async function saveInscription(pageSlug, formData) {
  const { data, error } = await supabase
    .from('inscriptions')
    .insert({
      page_slug: pageSlug,
      data: formData,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao salvar inscrição:', error);
    return null;
  }
  
  return data;
}
```

### Confirmar Inscrição

```javascript
async function confirmInscription(id) {
  const { data, error } = await supabase
    .from('inscriptions')
    .update({ status: 'confirmed' })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao confirmar:', error);
    return null;
  }
  
  return data;
}
```

### Deletar Inscrição

```javascript
async function deleteInscription(id) {
  const { error } = await supabase
    .from('inscriptions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao deletar:', error);
    return false;
  }
  
  return true;
}
```

### Estatísticas

```javascript
async function getInscriptionStats(pageSlug) {
  const { data, error } = await supabase
    .from('inscriptions')
    .select('status')
    .eq('page_slug', pageSlug);
  
  if (error) {
    console.error('Erro ao carregar stats:', error);
    return { total: 0, confirmed: 0, pending: 0 };
  }
  
  return {
    total: data.length,
    confirmed: data.filter(i => i.status === 'confirmed').length,
    pending: data.filter(i => i.status === 'pending').length
  };
}
```

---

## 🎯 Resumo

| Aspecto | Decisão | Motivo |
|---------|---------|--------|
| **Número de tabelas** | 1 tabela | Escalabilidade e manutenção |
| **Identificação** | `page_slug` | Flexível e legível |
| **Dados do formulário** | JSONB | Campos dinâmicos por página |
| **IDs** | Auto-incremento | Simples e eficiente |
| **Timestamps** | `created_at` + `updated_at` | Auditoria completa |
| **Status** | ENUM via CHECK | Validação no banco |
| **Índices** | Múltiplos | Performance otimizada |

---

**Estrutura simples, escalável e eficiente!** 🚀
