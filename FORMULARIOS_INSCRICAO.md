# Sistema de Formulários de Inscrição

## 📋 Visão Geral

O sistema permite criar páginas com formulários personalizados para inscrição em aventuras, sem necessidade de código.

---

## ✨ Funcionalidades

- ✅ Criação visual de formulários
- ✅ 10 tipos de campos diferentes
- ✅ Validação automática de campos obrigatórios
- ✅ Armazenamento local das inscrições
- ✅ Envio por email (configurável)
- ✅ Interface responsiva
- ✅ Confirmação de envio

---

## 🎯 Como Criar um Formulário de Inscrição

### Passo 1: Acessar o Admin

1. Acesse `/admin.html`
2. Faça login (senha: `admin123`)
3. Vá para a aba **"Páginas"**

### Passo 2: Criar Nova Página

1. Clique em **"+ Nova Página"**
2. Preencha o **Label** (ex: "Inscrição Trilha do Pico")
3. O **Slug** será gerado automaticamente
4. ✅ **Marque a opção**: "Esta página é um formulário de inscrição"

### Passo 3: Configurar o Formulário

Quando marcar como formulário, novos campos aparecerão:

#### Informações Básicas

- **Título do Formulário**: Ex: "Inscrição para Trilha do Pico"
- **Descrição**: Texto explicativo (opcional)
- **Gerenciamento**: As inscrições serão gerenciadas na aba "Inscrições" do admin

#### Adicionar Campos

1. Clique em **"+ Adicionar Campo"**
2. Configure cada campo:
   - **Tipo de Campo**: Escolha o tipo apropriado
   - **Label do Campo**: Nome que aparece para o usuário
   - **Placeholder**: Texto de exemplo (opcional)
   - **Campo obrigatório**: Marque se for obrigatório
   - **Opções**: Para select, radio e checkbox-group

### Passo 4: Salvar

1. Clique em **"💾 Salvar Página"**
2. A página aparecerá no menu automaticamente
3. Compartilhe o link com seus clientes!

---

## 📝 Tipos de Campos Disponíveis

### 1. Texto (uma linha)
**Uso**: Nome, cidade, etc.
```
Exemplo: Nome completo
```

### 2. Texto (múltiplas linhas)
**Uso**: Observações, experiência prévia, etc.
```
Exemplo: Conte-nos sobre sua experiência em trilhas
```

### 3. Email
**Uso**: Email do participante
```
Exemplo: Seu melhor email
```

### 4. Telefone
**Uso**: Contato telefônico
```
Exemplo: WhatsApp para contato
```

### 5. Número
**Uso**: Idade, quantidade de pessoas, etc.
```
Exemplo: Idade
```

### 6. Data
**Uso**: Data de nascimento, data preferida, etc.
```
Exemplo: Data de nascimento
```

### 7. Lista suspensa (select)
**Uso**: Escolha única entre várias opções
```
Label: Nível de experiência
Opções (uma por linha):
Iniciante
Intermediário
Avançado
```

### 8. Múltipla escolha (radio)
**Uso**: Escolha única, visualmente mais clara
```
Label: Tamanho da camiseta
Opções:
P
M
G
GG
```

### 9. Checkbox único
**Uso**: Aceite de termos, confirmações
```
Label: Termos
Placeholder: Li e aceito os termos de participação
```

### 10. Grupo de checkboxes
**Uso**: Múltiplas escolhas permitidas
```
Label: Equipamentos que possui
Opções:
Mochila de trilha
Bota de trekking
Bastão de caminhada
Barraca
Saco de dormir
```

---

## 💡 Exemplos de Formulários

### Exemplo 1: Inscrição Básica para Trilha

**Campos**:
1. Nome completo (texto, obrigatório)
2. Email (email, obrigatório)
3. WhatsApp (telefone, obrigatório)
4. Nível de experiência (select, obrigatório)
   - Iniciante
   - Intermediário
   - Avançado
5. Observações (textarea, opcional)

### Exemplo 2: Inscrição Completa para Expedição

**Campos**:
1. Nome completo (texto, obrigatório)
2. Data de nascimento (date, obrigatório)
3. Email (email, obrigatório)
4. Telefone (tel, obrigatório)
5. Cidade (texto, obrigatório)
6. Experiência em trilhas (textarea, obrigatório)
7. Nível de condicionamento físico (radio, obrigatório)
   - Sedentário
   - Pratico exercícios ocasionalmente
   - Pratico exercícios regularmente
   - Atleta
8. Equipamentos que possui (checkbox-group, opcional)
   - Mochila
   - Bota
   - Bastão
   - Barraca
   - Saco de dormir
9. Restrições alimentares (textarea, opcional)
10. Aceite de termos (checkbox, obrigatório)

### Exemplo 3: Inscrição para Curso de Escalada

**Campos**:
1. Nome completo (texto, obrigatório)
2. Email (email, obrigatório)
3. Telefone (tel, obrigatório)
4. Já praticou escalada? (radio, obrigatório)
   - Nunca
   - Poucas vezes
   - Pratico regularmente
5. Turma preferida (select, obrigatório)
   - Manhã (8h-12h)
   - Tarde (14h-18h)
   - Noite (18h-22h)
6. Tamanho de sapatilha (number, obrigatório)
7. Observações (textarea, opcional)

---

## 📊 Gerenciamento de Inscrições

### Painel de Inscrições no Admin

Todas as inscrições são gerenciadas diretamente no admin, na aba **"Inscrições"**.

**Como acessar**:
1. Vá para `/admin.html`
2. Clique na aba "Inscrições"

### Funcionalidades do Painel

#### Estatísticas em Tempo Real
- **Total de Inscrições**: Contador geral
- **Confirmadas**: Inscrições já processadas
- **Pendentes**: Aguardando confirmação

#### Filtros Avançados
- **Por Página**: Veja inscrições de um formulário específico
- **Por Status**: Pendentes ou Confirmadas
- **Busca**: Procure por nome, email, ou qualquer dado

#### Ações Disponíveis
- **✓ Confirmar**: Marca inscrição como confirmada
- **✗ Desconfirmar**: Volta para pendente
- **🗑️ Excluir**: Remove a inscrição
- **📥 Exportar CSV**: Baixa planilha com todas as inscrições filtradas
- **🗑️ Limpar Tudo**: Remove todas as inscrições (cuidado!)

### Armazenamento

Todas as inscrições são salvas automaticamente no `localStorage` do navegador.

**Backup automático**: Sempre que alguém se inscreve, os dados são salvos localmente.

---

## 🔗 Compartilhando o Formulário

### Link Direto

Após criar a página, o link será:
```
https://seu-site.com/p/#nome-do-slug
```

Exemplo:
```
https://aventuras.vercel.app/p/#inscricao-trilha-pico
```

### QR Code

1. Use um gerador de QR Code (https://qr-code-generator.com)
2. Cole o link do formulário
3. Baixe o QR Code
4. Compartilhe em redes sociais, flyers, etc.

### WhatsApp

Envie mensagem com o link:
```
Olá! Para se inscrever na Trilha do Pico, 
preencha o formulário: 
https://seu-site.com/p/#inscricao-trilha-pico
```

---

## 📊 Gerenciando Inscrições

### Ver Inscrições (Método Simples)

1. Abra o console do navegador (F12)
2. Digite:
```javascript
const inscriptions = JSON.parse(localStorage.getItem('inscriptions'));
console.table(inscriptions['nome-do-slug']);
```

### Exportar Inscrições

```javascript
// No console
const inscriptions = JSON.parse(localStorage.getItem('inscriptions'));
const blob = new Blob([JSON.stringify(inscriptions, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'inscricoes.json';
a.click();
```

### Limpar Inscrições

```javascript
// CUIDADO: Isso apaga todas as inscrições!
localStorage.removeItem('inscriptions');
```

---

## 🎨 Personalização

### Cores do Formulário

As cores seguem o tema do site. Para mudar:

1. Vá para aba **"Tema"** no admin
2. Ajuste as cores
3. O formulário será atualizado automaticamente

### Textos de Confirmação

Edite em `/assets/js/page.js` (linha ~147):
```javascript
<h2>✅ Inscrição enviada com sucesso!</h2>
<p>Você receberá uma confirmação em breve.</p>
```

---

## ⚠️ Validações Automáticas

O sistema valida automaticamente:

- ✅ Campos obrigatórios preenchidos
- ✅ Formato de email válido
- ✅ Formato de telefone (se especificado)
- ✅ Números válidos
- ✅ Datas válidas

---

## 🔒 Segurança e Privacidade

### Dados Armazenados

- **Onde**: localStorage do navegador
- **Acesso**: Apenas você (no seu navegador)
- **Persistência**: Até limpar cache/dados

### LGPD

Para conformidade com LGPD:

1. Adicione campo de aceite de termos
2. Crie página de Política de Privacidade
3. Informe como os dados serão usados

**Exemplo de texto**:
```
Ao enviar este formulário, você concorda com nossa 
Política de Privacidade e autoriza o uso dos seus 
dados para fins de inscrição na atividade.
```

---

## 🐛 Troubleshooting

### Formulário não aparece

1. Verifique se marcou "Esta página é um formulário"
2. Confirme que salvou a página
3. Limpe o cache do navegador

### Campos não aparecem

1. Verifique se adicionou campos
2. Confirme que cada campo tem um label
3. Recarregue a página

### Inscrição não envia

1. Verifique console do navegador (F12)
2. Confirme que preencheu campos obrigatórios
3. Verifique se email está configurado

---

## 📈 Próximos Passos

### Melhorias Futuras

- [ ] Painel de visualização de inscrições no admin
- [ ] Exportar inscrições para Excel/CSV
- [ ] Integração com Google Sheets
- [ ] Notificações push para novas inscrições
- [ ] Limite de vagas por formulário
- [ ] Pagamento integrado
- [ ] Confirmação automática por email

---

## 💡 Dicas de Uso

1. **Teste primeiro**: Crie um formulário de teste antes do real
2. **Seja claro**: Use labels descritivos
3. **Não exagere**: Formulários longos desanimam
4. **Marque obrigatórios**: Apenas o essencial
5. **Dê feedback**: Sempre mostre mensagem de sucesso
6. **Compartilhe fácil**: Use QR Code e links curtos
7. **Monitore**: Verifique inscrições regularmente

---

## 🎉 Pronto!

Agora você pode criar formulários profissionais de inscrição sem escrever uma linha de código!

**Dúvidas?** Consulte o [MANUAL_USUARIO.md](MANUAL_USUARIO.md) ou [COMANDOS_UTEIS.md](COMANDOS_UTEIS.md).
