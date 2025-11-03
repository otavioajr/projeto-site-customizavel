# Verificação de Políticas RLS (Row Level Security) no Supabase

## O Que é RLS?

Row Level Security (RLS) é um sistema de segurança do PostgreSQL/Supabase que controla quem pode inserir, ler, atualizar ou deletar dados em cada tabela.

**ATENÇÃO**: Se as políticas RLS não estiverem configuradas corretamente, as inscrições **NÃO SERÃO SALVAS** mesmo que o código esteja correto!

---

## Como Verificar as Políticas

### 1. Acessar o Dashboard do Supabase

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **"Authentication"** → **"Policies"**
4. OU clique em **"Table Editor"** → selecione a tabela `inscriptions` → aba **"Policies"**

### 2. Verificar Políticas da Tabela `inscriptions`

A tabela `inscriptions` **DEVE** ter uma política que permite INSERT para usuários anônimos (não autenticados).

#### Política Recomendada

```sql
-- Nome da política: "Allow anonymous inscriptions"
-- Operação: INSERT
-- Para quem: anon (usuário anônimo)

CREATE POLICY "Allow anonymous inscriptions" 
ON inscriptions 
FOR INSERT 
TO anon 
WITH CHECK (true);
```

### 3. Como Criar a Política (se não existir)

No dashboard do Supabase:

1. Vá em **Table Editor** → `inscriptions`
2. Clique na aba **"Policies"**
3. Clique em **"New Policy"**
4. Selecione **"Create a policy from scratch"**
5. Preencha:
   - **Policy name**: `Allow anonymous inscriptions`
   - **Allowed operation**: `INSERT`
   - **Target roles**: Marque `anon`
   - **USING expression**: deixe em branco
   - **WITH CHECK expression**: `true`
6. Clique em **"Review"** e depois **"Save policy"**

---

## Sintomas de Problema com RLS

Se as políticas RLS estiverem bloqueando as inserções, você verá:

### No Console do Navegador (F12):
```
❌ [saveInscription] Erro do Supabase ao inserir: {...}
  Código do erro: 42501
  Mensagem: new row violates row-level security policy
```

### Para o Usuário:
- Mensagem de "sucesso" aparece (em versões antigas do código)
- MAS a inscrição não aparece no Supabase
- Console mostra erro de permissão

---

## Como Testar

### Teste 1: Via SQL Editor

No Supabase, vá em **SQL Editor** e execute:

```sql
-- Verificar se a política existe
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'inscriptions';
```

**Resultado esperado**: Deve mostrar pelo menos uma política com:
- `cmd = 'INSERT'`
- `roles` contendo `anon`

### Teste 2: Inserção Manual

Tente inserir uma inscrição manualmente via SQL Editor **SEM autenticação**:

```sql
-- Teste de inserção (deve funcionar se RLS estiver correto)
INSERT INTO inscriptions (
    page_slug,
    group_id,
    is_responsible,
    participant_number,
    total_participants,
    form_data,
    status
) VALUES (
    'teste-slug',
    gen_random_uuid(),
    true,
    1,
    1,
    '{"nome": "Teste", "_sequence": 999}',
    'pending'
);
```

**Resultado esperado**: 
- ✅ Se funcionar: RLS está OK
- ❌ Se der erro de permissão: RLS está bloqueando

---

## Políticas Adicionais Recomendadas

Além de INSERT, você pode querer configurar:

### Permitir SELECT para usuários anônimos
```sql
CREATE POLICY "Allow anonymous read inscriptions" 
ON inscriptions 
FOR SELECT 
TO anon 
USING (true);
```

### Permitir UPDATE/DELETE apenas para admin autenticado
```sql
CREATE POLICY "Allow authenticated update inscriptions" 
ON inscriptions 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete inscriptions" 
ON inscriptions 
FOR DELETE 
TO authenticated 
USING (true);
```

---

## Checklist de Verificação

- [ ] Dashboard do Supabase acessível
- [ ] Tabela `inscriptions` existe
- [ ] RLS está **habilitado** na tabela (se não, habilite)
- [ ] Existe política de INSERT para `anon`
- [ ] Política tem `WITH CHECK (true)` ou expressão permissiva
- [ ] Teste manual de INSERT funciona
- [ ] Formulário de inscrição no site funciona
- [ ] Inscrições aparecem no Table Editor após submissão

---

## Comandos SQL Úteis

### Habilitar RLS na tabela
```sql
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;
```

### Ver todas as políticas
```sql
SELECT * FROM pg_policies WHERE tablename = 'inscriptions';
```

### Remover política (se necessário)
```sql
DROP POLICY IF EXISTS "nome_da_politica" ON inscriptions;
```

### Desabilitar RLS (NÃO RECOMENDADO em produção)
```sql
ALTER TABLE inscriptions DISABLE ROW LEVEL SECURITY;
```

---

## Contato

Se após seguir este guia as inscrições ainda não estiverem sendo salvas:

1. Verifique os logs no Console do navegador (F12)
2. Procure por códigos de erro `42501` ou `PGRST301`
3. Entre em contato com suporte do Supabase se necessário

---

**Data de criação**: 3 de Novembro de 2025  
**Última atualização**: 3 de Novembro de 2025

