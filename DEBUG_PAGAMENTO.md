# 🔍 Debug: PIX/WhatsApp Não Aparecem

## ✅ Correção 1: Dados do Responsável no Admin

**RESOLVIDO!** Agora quando você abre os detalhes de uma inscrição no admin, mostra:

```
📋 Dados do Responsável pela Inscrição:
- Nome do Responsável: Maria Silva
- Email do Responsável: maria@email.com
- Telefone do Responsável: (11) 99999-9999

👤 Dados do Participante:
- Nome do Participante: João Silva
- CPF: 111.111.111-11
```

---

## ⚠️ Problema 2: PIX/WhatsApp Não Aparecem

### Vamos Debugar Juntos

Siga estes passos:

#### 1. Recarregue o Navegador
- Pressione **Ctrl+Shift+R** (Windows/Linux)
- Ou **Cmd+Shift+R** (Mac)
- Isso garante que o novo código seja carregado

#### 2. Abra o Console do Navegador
- Pressione **F12**
- Clique na aba **"Console"**
- Mantenha aberto

#### 3. Faça Nova Inscrição
- Vá ao formulário
- Preencha e envie
- Aguarde ir para a página de confirmação

#### 4. Verifique os Logs no Console

Você deve ver logs assim:

```
🔍 setupPaymentSection chamada: {
  page_slug: "teste-grupo",
  requires_payment: true,
  has_payment_config: true,
  payment_config: { value: 100, whatsapp: "11999999999", ... },
  groupSize: 2,
  isGroupView: true
}

✅ Pagamento configurado!
```

**OU**

```
🔍 setupPaymentSection chamada: {
  page_slug: "teste-grupo",
  requires_payment: false,  ← PROBLEMA AQUI
  has_payment_config: false, ← PROBLEMA AQUI
  ...
}

❌ Pagamento não configurado, escondendo seções
```

---

## 📸 Me Envie

Tire uma **screenshot** ou **copie e cole** o que apareceu no console após "🔍 setupPaymentSection chamada"

---

## 🎯 Possíveis Causas

### Causa 1: Configuração Não Salvou
```
PROBLEMA: Você marcou o checkbox mas não clicou em SALVAR
SOLUÇÃO: 
1. Vá ao admin
2. Edite o formulário
3. Marque checkbox
4. Preencha campos
5. CLIQUE EM SALVAR (botão verde no final da página)
```

### Causa 2: Editou Formulário Errado
```
PROBLEMA: Editou outro formulário, não o "teste-grupo"
SOLUÇÃO:
1. Vá ao admin
2. Confirme que está editando "teste grupo" (o que tem inscrições)
3. Configure pagamento
4. Salve
```

### Causa 3: Campos Vazios
```
PROBLEMA: Marcou checkbox mas deixou campos vazios
SOLUÇÃO:
Todos estes campos são OBRIGATÓRIOS:
- Valor da Inscrição: 100
- Chave PIX: (sua chave pix completa)
- WhatsApp: 11999999999 (só números, sem espaços)
```

---

## ✅ Checklist Rápido

Antes de testar novamente:

- [ ] Recarreguei com Ctrl+Shift+R
- [ ] Console está aberto (F12)
- [ ] Vou fazer NOVA inscrição (não reload da página antiga)
- [ ] Vou copiar os logs que aparecerem

---

## 🚨 Se Logs Mostram "❌ Pagamento não configurado"

Significa que a configuração NÃO foi salva corretamente.

### Faça isto:

1. **Abra**: `http://localhost:3001/admin.html`

2. **Clique em "Editar"** no formulário que você está usando

3. **Role até o final da página** (seção de Pagamento)

4. **Verifique assim:**
   ```
   ☑ Requer Pagamento (PIX)  ← Deve estar MARCADO

   Valor da Inscrição (R$) *
   [100              ]  ← Deve ter valor

   Chave PIX (Copia e Cola) *
   [sua-chave-aqui   ]  ← Deve estar preenchida

   WhatsApp *
   [11999999999      ]  ← Só números
   ```

5. **Role ATÉ O FINAL** e clique no **botão verde "SALVAR"**

6. **Aguarde** aparecer mensagem de sucesso

7. **Faça NOVA inscrição**

---

## 🎯 O Que Esperar Quando Funcionar

### Na página de confirmação para GRUPOS:

```
INSCRIÇÃO REALIZADA

💰 Pagamento de Grupo

💵 Valor a ser pago:
R$ 200.00
(2 participantes × R$ 100.00 cada)

📱 Entre em contato pelo WhatsApp abaixo.

[📱 Enviar Mensagem no WhatsApp]
```

---

## 📋 Status Atual

| Item | Status |
|------|--------|
| Dados responsável no admin | ✅ Corrigido |
| IDs começam do #1 | ✅ Corrigido |
| PIX/WhatsApp aparecem | 🔍 Aguardando debug |

---

**Próximo passo:** Me envie os logs do console! 🚀
