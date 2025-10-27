# 🚀 Próximos Passos - Supabase Configurado

## ✅ O que já está pronto:

1. ✅ **Credenciais configuradas** - Arquivo `config.js` criado com suas credenciais
2. ✅ **Código atualizado** - Integração Supabase implementada
3. ✅ **Script SQL pronto** - `SETUP_TABELAS.sql` contém todas as tabelas
4. ✅ **Página de teste** - `test-supabase.html` para validar conexão
5. ✅ **Servidor funcionando** - Rodando em http://localhost:3000
6. ✅ **Código commitado** - Push feito para o repositório

---

## 🚨 AÇÃO NECESSÁRIA (2 minutos):

### Passo 1: Criar tabelas no Supabase

1. Acesse: https://supabase.com
2. Entre no projeto: `yzsgoxrrhjiiulmnwrfo`
3. Menu lateral: **"SQL Editor"** (ícone `</>`)
4. Clique em **"New query"**
5. Abra o arquivo **`SETUP_TABELAS.sql`**
6. **Copie TODO o conteúdo** do arquivo
7. Cole no editor do Supabase
8. Clique em **"Run"** (ou Ctrl+Enter)
9. Aguarde a mensagem: **"Success. No rows returned"**

### Passo 2: Testar a conexão

1. Certifique-se que o servidor está rodando:
   ```bash
   npm start
   ```

2. Acesse no navegador:
   ```
   http://localhost:3000/test-supabase.html
   ```

3. Você deve ver **6 testes** com status ✅:
   - ✅ Variáveis de Ambiente
   - ✅ Cliente Supabase
   - ✅ Conectividade
   - ✅ Tabelas
   - ✅ Leitura de Dados
   - ✅ Políticas RLS
   - ✅ Escrita de Dados

### Passo 3: Testar no Admin

1. Acesse: http://localhost:3000/admin.html
2. Senha: `admin123`
3. Vá na aba **"Páginas"**
4. Clique em **"+ Nova Página"**
5. Preencha:
   - Label: `Teste`
   - Slug: `teste`
   - URL do Canva: `https://www.canva.com/design/exemplo`
6. Clique em **"💾 Salvar Página"**
7. Abra o console do navegador (F12)
8. Verifique se aparece: **"✅ Supabase conectado com sucesso!"**

### Passo 4: Validar Persistência

1. Limpe o cache do navegador:
   - Chrome/Edge: Ctrl+Shift+Delete → Limpar dados
   - Ou use modo anônimo
2. Recarregue a página: http://localhost:3000/admin.html
3. Vá na aba **"Páginas"**
4. **A página "Teste" deve continuar lá!** 🎉

---

## 📊 Estrutura do Banco de Dados

### Tabela: `pages`
Armazena todas as páginas do menu

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único da página |
| label | TEXT | Nome no menu |
| slug | TEXT | URL da página |
| order | INTEGER | Ordem no menu |
| is_active | BOOLEAN | Página visível? |
| is_form | BOOLEAN | É formulário? |
| canva_embed_url | TEXT | URL do Canva |
| form_config | JSONB | Config do formulário |

### Tabela: `home_content`
Conteúdo da página principal (1 registro único)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID fixo: `00000000-0000-0000-0000-000000000001` |
| content | JSONB | Todo conteúdo da home |

### Tabela: `inscriptions`
Inscrições dos formulários

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| page_slug | TEXT | Slug da página |
| form_data | JSONB | Dados do formulário |
| status | TEXT | pending/confirmed |

---

## 🔧 Comandos Úteis

```bash
# Iniciar servidor
npm start

# Verificar se está rodando
curl http://localhost:3000

# Ver logs do servidor
# (se rodou em background, use Ctrl+C para parar)

# Fazer backup do banco (via Supabase dashboard)
# Settings → Database → Database Backups
```

---

## 🆘 Problemas Comuns

### ❌ Teste falha: "Tabelas não encontradas"
**Solução:** Execute o SQL no Supabase (Passo 1)

### ❌ Teste falha: "Erro de conexão"
**Solução:** Verifique se as credenciais em `config.js` estão corretas

### ❌ "Supabase não configurado" no console
**Solução:**
1. Verifique se `config.js` existe na raiz
2. Recarregue a página com Ctrl+Shift+R

### ❌ Erro 403 no Supabase
**Solução:** Verifique se as políticas RLS foram criadas (rodou todo o SQL?)

---

## 📝 Notas Importantes

1. **Segurança MVP:** As políticas RLS atuais permitem acesso público para facilitar desenvolvimento. Para produção, implemente autenticação.

2. **Backup:** O Supabase faz backup automático, mas você pode exportar os dados manualmente via SQL Editor.

3. **Limits do Plano Gratuito:**
   - 500MB de armazenamento
   - 2GB de transferência/mês
   - Pausado após 7 dias de inatividade (reativa automaticamente)

4. **Deploy em Produção (Vercel):**
   - Configure variáveis de ambiente no painel da Vercel:
     - `SUPABASE_URL`: https://yzsgoxrrhjiiulmnwrfo.supabase.co
     - `SUPABASE_ANON_KEY`: sua-chave-anon
   - O arquivo `api/config.js` já está configurado para isso

---

## 🎯 Resultado Final

Depois de completar os passos:
- ✅ Dados persistem permanentemente
- ✅ Não somem ao limpar cache
- ✅ Funcionam em qualquer dispositivo
- ✅ Backup automático na nuvem
- ✅ Pronto para produção

---

## 📞 Suporte

- **Documentação Supabase:** https://supabase.com/docs
- **Dashboard Supabase:** https://supabase.com/dashboard
- **Seu Projeto:** https://supabase.com/dashboard/project/yzsgoxrrhjiiulmnwrfo

---

**Tempo estimado total:** 5 minutos
**Última atualização:** 2025-10-27
