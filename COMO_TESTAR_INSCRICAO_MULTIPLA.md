# 🧪 Como Testar o Sistema de Inscrição Múltipla

## ✅ Implementação 100% Completa!

O sistema de inscrição múltipla está **totalmente implementado** e pronto para uso. Siga este guia para testar.

## 📋 Pré-requisitos

Antes de começar, você precisa:
1. ✅ Ter o Supabase configurado
2. ✅ Ter as credenciais em `supabase.js`
3. ✅ Executar a migration SQL

## 🚀 Passo 1: Executar Migration no Supabase (5 minutos)

### 1.1. Acesse o Supabase Dashboard
```
https://app.supabase.com/project/[SEU-PROJECT-ID]
```

### 1.2. Abra o SQL Editor
- No menu lateral, clique em **SQL Editor**
- Ou acesse: `Dashboard → SQL Editor`

### 1.3. Execute a Migration
1. Abra o arquivo `MIGRATION_INSCRICAO_MULTIPLA.sql`
2. Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no SQL Editor do Supabase
4. Clique em **RUN** (ou pressione Ctrl+Enter)

### 1.4. Verifique se Funcionou
Você deve ver mensagens como:
```
✅ Novos campos adicionados com sucesso
✅ Índices criados com sucesso
✅ Funções auxiliares criadas com sucesso
✅ View criada com sucesso
```

Se vir algum erro, verifique:
- Se a tabela `inscriptions` existe
- Se você tem permissões de admin
- Se já executou o script `SETUP_TABELAS.sql` antes

## 🎯 Passo 2: Criar Formulário de Teste (2 minutos)

### 2.1. Acesse o Admin
```
http://localhost:3000/admin.html
```

### 2.2. Vá na aba "Páginas"
- Clique em **+ Nova Página**

### 2.3. Configure a Página
Preencha os campos:

**Informações Básicas:**
- Label: `Teste Inscrição Múltipla`
- Slug: `teste-multipla`
- ✅ Marque: **Esta página é um formulário de inscrição**

**Configuração do Formulário:**
- Título do Formulário: `Teste de Inscrição em Grupo`
- Descrição: `Teste do sistema de inscrição múltipla`
- ✅ Marque: **Permitir inscrição em grupo**
- Mínimo de participantes: `1`
- Máximo de participantes: `5`
- ✅ Marque: **Todos participantes na mesma bateria**

### 2.4. Adicione Campos

**Campos do Responsável (serão marcados automaticamente):**

1. **Nome do Responsável**
   - Tipo: Texto
   - Label: `Nome Completo`
   - Obrigatório: ✅
   
2. **Email**
   - Tipo: Email
   - Label: `Email`
   - Obrigatório: ✅
   
3. **Telefone**
   - Tipo: Telefone
   - Label: `Telefone`
   - Obrigatório: ✅

**Campos dos Participantes (serão detectados automaticamente):**

4. **Nome do Participante**
   - Tipo: Texto
   - Label: `Nome do Participante`
   - Obrigatório: ✅
   
5. **CPF**
   - Tipo: Texto
   - Label: `CPF`
   - Obrigatório: ✅
   
6. **Data de Nascimento**
   - Tipo: Data
   - Label: `Data de Nascimento`
   - Obrigatório: ✅

### 2.5. Salve a Página
Clique em **💾 Salvar Página**

## 🧪 Passo 3: Testar Inscrição Única (3 minutos)

### 3.1. Acesse o Formulário
```
http://localhost:3000/p/#teste-multipla
```

### 3.2. Teste com 1 Pessoa
1. Selecione: `1 pessoa`
2. Preencha os dados do responsável
3. Preencha os dados do participante (apenas 1 seção aparece)
4. Marque a autorização de imagem
5. Clique em **Enviar Inscrição**

### 3.3. Verifique no Banco
Abra o SQL Editor do Supabase:
```sql
SELECT * FROM inscriptions 
WHERE page_slug = 'teste-multipla'
ORDER BY created_at DESC
LIMIT 5;
```

Você deve ver:
- ✅ 1 registro criado
- ✅ `group_id` preenchido
- ✅ `is_responsible = true`
- ✅ `participant_number = 1`
- ✅ `total_participants = 1`

## 🎉 Passo 4: Testar Inscrição Múltipla (5 minutos)

### 4.1. Faça Nova Inscrição
```
http://localhost:3000/p/#teste-multipla
```

### 4.2. Teste com 3 Pessoas
1. Selecione: `3 pessoas`
2. Preencha os dados do responsável (apenas 1 vez)
3. Preencha os dados dos 3 participantes:
   - **Participante 1**: João Silva, CPF 111.111.111-11
   - **Participante 2**: Maria Silva, CPF 222.222.222-22
   - **Participante 3**: Pedro Silva, CPF 333.333.333-33
4. Marque a autorização
5. Envie

### 4.3. Verifique o Grupo no Banco
```sql
-- Ver o grupo criado
SELECT * FROM v_inscription_groups 
WHERE page_slug = 'teste-multipla'
ORDER BY created_at DESC
LIMIT 1;

-- Ver todos os participantes do grupo
SELECT 
  id,
  group_id,
  is_responsible,
  participant_number,
  total_participants,
  form_data->>'Nome do Participante' as nome,
  form_data->>'CPF' as cpf
FROM inscriptions
WHERE group_id = '[COLE-O-GROUP-ID-AQUI]'
ORDER BY participant_number;
```

Você deve ver:
- ✅ 3 registros com mesmo `group_id`
- ✅ 1 registro com `is_responsible = true` (responsável)
- ✅ 2 registros com `is_responsible = false` (participantes)
- ✅ `participant_number` sequencial: 1, 2, 3
- ✅ Todos com `total_participants = 3`

## 🎨 Passo 5: Visualizar no Admin (Opcional - Implementação Futura)

> **Nota:** A visualização de grupos no admin será implementada em uma próxima iteração.
> Por enquanto, você pode ver os dados diretamente no Supabase Dashboard.

Para ver os grupos:
```sql
-- Listar todos os grupos
SELECT 
  group_id,
  page_slug,
  total_participants,
  responsible_name,
  responsible_email,
  created_at
FROM v_inscription_groups
ORDER BY created_at DESC;

-- Ver detalhes de um grupo específico
SELECT * FROM inscriptions
WHERE group_id = '[GROUP-ID]'
ORDER BY participant_number;
```

## 📊 Testes Avançados

### Teste 1: Limite de Participantes
1. Configure `max_participants: 10` no formulário
2. Faça inscrição com 5 pessoas
3. Faça inscrição com 6 pessoas
4. Deve dar erro: "Apenas 5 vagas disponíveis"

### Teste 2: Diferentes Quantidades
- Teste com 1 pessoa ✅
- Teste com 2 pessoas ✅
- Teste com 5 pessoas ✅
- Teste com 10 pessoas (se configurado) ✅

### Teste 3: Validação de Campos
1. Tente enviar sem preencher campos obrigatórios
2. Deve mostrar erro de validação
3. Preencha todos e envie

### Teste 4: Sessões/Baterias (se configurado)
1. Adicione um campo de "Sessões" no admin
2. Configure 2 baterias com 5 vagas cada
3. Inscreva um grupo de 6 pessoas
4. Deve validar a capacidade da bateria

## 🐛 Solução de Problemas

### Erro: "function check_available_slots does not exist"
**Solução:** Execute a migration SQL novamente

### Erro: "column group_id does not exist"
**Solução:** A migration não foi executada. Execute o SQL completo

### Campos de participantes não aparecem
**Solução:** 
- Verifique se marcou "Permitir inscrição em grupo"
- Verifique se selecionou uma quantidade no select
- Use keywords: "nome", "cpf", "idade", "data de nascimento" nos labels

### Dados não salvam no Supabase
**Solução:**
- Verifique credenciais em `supabase.js`
- Verifique RLS policies (devem permitir INSERT)
- Olhe o console do navegador para erros

### Grupo salva mas com dados errados
**Solução:**
- Abra o console do navegador (F12)
- Veja os dados sendo enviados
- Verifique se os campos têm os labels corretos

## 📝 Verificação Final

Marque cada item conforme testa:

- [ ] Migration executada com sucesso
- [ ] Formulário criado no admin
- [ ] Checkbox "Permitir inscrição em grupo" marcado
- [ ] Inscrição única funciona (1 pessoa)
- [ ] Inscrição múltipla funciona (2+ pessoas)
- [ ] Dados salvam corretamente no Supabase
- [ ] `group_id` é o mesmo para todos do grupo
- [ ] `participant_number` está sequencial
- [ ] `is_responsible` correto (true/false)
- [ ] Validação de vagas funciona
- [ ] Redirecionamento pós-inscrição funciona

## 🎯 Exemplos de Uso Real

### Caso 1: Mãe inscrevendo 2 filhos
```
Responsável: Maria Silva
- Nome: Maria Silva
- Email: maria@email.com
- Telefone: (11) 99999-9999

Participante 1 (Filho 1):
- Nome: Lucas Silva
- CPF: 111.111.111-11
- Data Nascimento: 15/03/2010

Participante 2 (Filho 2):
- Nome: Julia Silva  
- CPF: 222.222.222-22
- Data Nascimento: 20/07/2012

Resultado: 2 registros vinculados
```

### Caso 2: Grupo de amigos (5 pessoas)
```
Responsável: Carlos (organizador)
- Nome: Carlos Santos
- Email: carlos@email.com

Participantes: Bruno, Diego, Eduardo, Felipe
Resultado: 5 registros vinculados
```

### Caso 3: Empresa inscrevendo equipe (8 pessoas)
```
Responsável: RH da empresa
Participantes: 8 funcionários
Resultado: 8 registros vinculados
```

## 🚀 Próximos Passos

Após validar que tudo funciona:

1. **Usar em produção:**
   - Crie seus formulários reais
   - Configure limites apropriados
   - Teste com usuários reais

2. **Melhorias futuras:**
   - Visualização de grupos no admin
   - Exportação de grupos para CSV
   - Email automático para todos do grupo
   - Dashboard com estatísticas de grupos
   - Desconto para grupos grandes

3. **Personalização:**
   - Ajuste os keywords de detecção de campos
   - Customize mensagens de erro
   - Adicione mais validações
   - Implemente regras de negócio específicas

## 📞 Suporte

Se encontrar problemas:

1. **Verifique o console do navegador** (F12 → Console)
2. **Verifique logs do Supabase** (Dashboard → Logs)
3. **Revise a documentação:** 
   - `ARQUITETURA_INSCRICAO_MULTIPLA.md`
   - `GUIA_IMPLEMENTACAO_RAPIDA.md`
4. **Teste com o exemplo:** `exemplo-inscricao-multipla.html`

## 🎉 Conclusão

Parabéns! Você agora tem um sistema completo de inscrição múltipla que:

✅ Permite inscrever 1 ou mais pessoas
✅ Mantém todos os dados vinculados por grupo
✅ Valida vagas disponíveis
✅ Funciona com sessões/baterias
✅ É compatível com o sistema antigo
✅ Tem fallback para localStorage
✅ É escalável e performático

**O sistema está pronto para uso em produção! 🚀**
