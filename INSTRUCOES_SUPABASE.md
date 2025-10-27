# 🚨 Configuração do Supabase - Ação Necessária

## Problema Detectado

A chave API do Supabase retornou erro: **"Invalid API key"**

Isso pode acontecer por alguns motivos:
1. A chave anon pode estar incorreta
2. O projeto Supabase pode estar pausado (inatividade de 7 dias)
3. As permissões RLS podem não estar configuradas

## ✅ Solução em 3 Passos

### Passo 1: Verificar/Obter credenciais corretas

1. Acesse: https://supabase.com/dashboard/project/yzsgoxrrhjiiulmnwrfo
2. Se o projeto estiver pausado, clique em "Resume project"
3. Vá em **Settings** → **API**
4. Copie novamente:
   - **Project URL**
   - **anon public key**

### Passo 2: Atualizar config.js

Edite o arquivo `config.js` com as credenciais corretas:

```javascript
window.SUPABASE_URL = 'SUA_URL_AQUI';
window.SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI';
```

### Passo 3: Executar SQL para criar tabelas

**No dashboard do Supabase:**

1. Vá em **SQL Editor** (menu lateral esquerdo, ícone `</>`)
2. Clique em **"New query"**
3. Abra o arquivo **`SETUP_TABELAS.sql`** deste projeto
4. **Copie TODO o conteúdo** do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **"Run"** (ou Ctrl/Cmd + Enter)
7. Aguarde a mensagem: **"Success. No rows returned"**

## 🧪 Verificar se funcionou

Após executar o SQL, rode:

```bash
node verificar-supabase.js
```

Você deve ver:
```
✅ Tabela "pages" existe
✅ Tabela "home_content" existe
✅ Tabela "inscriptions" existe
```

## 🚀 Iniciar o projeto

Depois que as tabelas estiverem criadas:

```bash
npm start
```

Acesse:
- Admin: http://localhost:3000/admin.html (senha: admin123)
- Site: http://localhost:3000
- Teste: http://localhost:3000/test-supabase.html

## 📞 Credenciais atuais no config.js

```
URL: https://yzsgoxrrhjiiulmnwrfo.supabase.co
```

**Se a URL ou chave estiverem erradas, atualize o `config.js`**

## 🆘 Troubleshooting

### Erro: "Invalid API key"
- Confirme que copiou a **anon public key** (não a service_role)
- Verifique se não há espaços extras
- Verifique se o projeto não está pausado

### Erro: "relation does not exist" ou "42P01"
- As tabelas não foram criadas ainda
- Execute o SQL do SETUP_TABELAS.sql no dashboard

### Projeto pausado
- Projetos gratuitos pausam após 7 dias de inatividade
- Basta clicar em "Resume project" no dashboard
