# ✅ Correção: Página de Confirmação para Grupos

## 🎯 Problema Resolvido

A página de confirmação só aceitava o parâmetro `id` (inscrição individual), mas grupos redirecionavam com `group` na URL, causando erro "Parâmetros inválidos".

---

## ❌ Erro Original

```
URL: /confirmacao?group=7265504f-af8b-4e4c-9cd4-5bf2acb097b8&page=teste-grupo
Erro: "Parâmetros inválidos na URL."
```

**Causa:** Página só buscava `id`, não reconhecia `group`.

---

## ✅ Solução Implementada

Adicionado suporte para parâmetro `group` na URL da confirmação.

### Mudanças Realizadas:

1. **Import da função de grupo**
   ```javascript
   import { getInscriptionGroup } from './supabase.js';
   ```

2. **Leitura de ambos parâmetros**
   ```javascript
   const inscriptionId = urlParams.get('id');     // Individual
   const groupId = urlParams.get('group');        // Grupo
   ```

3. **Validação flexível**
   ```javascript
   if ((!inscriptionId && !groupId) || !pageSlug) {
     renderError('Parâmetros inválidos na URL.', 'Erro');
     return;
   }
   ```

4. **Busca condicional**
   ```javascript
   if (groupId) {
     // Buscar grupo completo
     inscription = await fetchInscriptionGroup(groupId);
   } else {
     // Buscar inscrição individual
     inscription = await fetchInscription(pageSlug, inscriptionId);
   }
   ```

5. **Função para buscar grupo**
   ```javascript
   async function fetchInscriptionGroup(groupId) {
     try {
       const group = await getInscriptionGroup(groupId);
       return group; // Retorna array de inscrições
     } catch (error) {
       console.error('Erro ao carregar grupo:', error);
       return null;
     }
   }
   ```

6. **Display adaptado**
   ```javascript
   function displayInscription(inscription, page, isGroupView = false) {
     if (isGroupView && Array.isArray(inscription)) {
       // Processar dados de grupo
       const responsible = inscription.find(i => i.is_responsible);
       formData = responsible?.form_data || {};
       groupSize = inscription.length;
       
       // Adicionar lista de participantes
       formData.participants = inscription
         .filter(i => !i.is_responsible)
         .map(i => i.form_data);
     } else {
       // Processar inscrição individual (original)
       // ...
     }
   }
   ```

---

## 🎨 Como Funciona Agora

### Inscrição Individual:
```
URL: /confirmacao?id=abc123&page=trilha
↓
Busca: getInscriptions() + filtro por id
↓
Mostra: Dados de 1 pessoa
```

### Inscrição de Grupo:
```
URL: /confirmacao?group=uuid-123&page=trilha
↓
Busca: getInscriptionGroup(uuid-123)
↓
Retorna: Array com todas inscrições do grupo
↓
Processa: 
  - Responsável (is_responsible = true)
  - Participantes (is_responsible = false)
↓
Mostra: 
  - "Grupo de N pessoas"
  - Lista com todos os participantes
```

---

## 📋 Estrutura de Dados

### Grupo Retornado do Banco:
```javascript
[
  {
    id: "uuid-1",
    group_id: "uuid-grupo",
    is_responsible: true,
    participant_number: 1,
    form_data: {
      "Nome do Responsável": "Maria Silva",
      "Email": "maria@email.com",
      // ...
    }
  },
  {
    id: "uuid-2", 
    group_id: "uuid-grupo",
    is_responsible: false,
    participant_number: 2,
    form_data: {
      "Nome do Participante": "João Silva",
      "CPF": "111.111.111-11",
      // ...
    }
  },
  {
    id: "uuid-3",
    group_id: "uuid-grupo", 
    is_responsible: false,
    participant_number: 3,
    form_data: {
      "Nome do Participante": "Pedro Silva",
      "CPF": "222.222.222-22",
      // ...
    }
  }
]
```

### Processamento:
```javascript
formData = {
  // Dados do responsável (primeiro item com is_responsible = true)
  "Nome do Responsável": "Maria Silva",
  "Email": "maria@email.com",
  
  // Lista de participantes adicionada
  participants: [
    {
      "Nome do Participante": "João Silva",
      "CPF": "111.111.111-11"
    },
    {
      "Nome do Participante": "Pedro Silva",
      "CPF": "222.222.222-22"
    }
  ]
}
```

---

## 🎨 Interface de Confirmação

### Grupo:
```
✅ Inscrição Confirmada!

Número da Inscrição: #1234
Nome: Grupo de 3 pessoas

Participantes:
1. João Silva
2. Pedro Silva  
3. Ana Silva

[Informações de pagamento...]
```

### Individual:
```
✅ Inscrição Confirmada!

Número da Inscrição: #1234
Nome: João Silva

[Informações de pagamento...]
```

---

## 💰 Pagamento para Grupos

### Comportamento Especial:
- **Grupo:** Esconde QR Code PIX, mostra apenas WhatsApp
- **Individual:** Mostra QR Code PIX + WhatsApp

**Motivo:** Grupos precisam de link de pagamento único para o valor total.

```javascript
if (isGroup) {
  const totalValue = paymentConfig.value * groupSize;
  // Mensagem: "Valor total: R$ 300.00 (R$ 100.00 × 3)"
  // Botão WhatsApp com mensagem pré-preenchida
}
```

---

## 🔧 Arquivo Modificado

**`assets/js/confirmacao.js`**
- ✅ Import de `getInscriptionGroup`
- ✅ Leitura de parâmetro `group`
- ✅ Função `fetchInscriptionGroup()`
- ✅ Lógica condicional de busca
- ✅ Processamento de dados de grupo
- ✅ Detecção de nomes em múltiplos formatos

---

## 🧪 Como Testar

### Teste 1: Inscrição Individual
1. Faça inscrição de 1 pessoa
2. Deve redirecionar para: `/confirmacao?id=xxx&page=yyy`
3. Deve mostrar dados da pessoa
4. ✅ Deve funcionar normalmente

### Teste 2: Inscrição de Grupo
1. Faça inscrição de 3 pessoas
2. Deve redirecionar para: `/confirmacao?group=xxx&page=yyy`
3. ✅ NÃO deve dar erro
4. ✅ Deve mostrar "Grupo de 3 pessoas"
5. ✅ Deve listar todos os participantes

---

## ✅ Checklist de Validação

- [ ] URL com `id` funciona (individual)
- [ ] URL com `group` funciona (grupo)
- [ ] Mostra número da inscrição
- [ ] Mostra lista de participantes
- [ ] Cálculo de valor total está correto
- [ ] WhatsApp pré-preenche mensagem correta
- [ ] QR Code PIX não aparece para grupos
- [ ] Sem erros no console

---

## 🚀 Status

| Item | Status |
|------|--------|
| Suporte a parâmetro `group` | ✅ Implementado |
| Busca de dados do grupo | ✅ Implementado |
| Processamento de array | ✅ Implementado |
| Lista de participantes | ✅ Implementado |
| Cálculo de pagamento | ✅ Implementado |
| Testes | ⏳ Pendente (usuário) |

---

**Data:** 02/11/2025 11:15 AM  
**Status:** ✅ Corrigido e pronto para teste  
**Arquivo modificado:** `confirmacao.js`

---

**IMPORTANTE:** Agora a página de confirmação aceita tanto `id` (individual) quanto `group` (múltiplas pessoas)! 🎉

**AINDA PENDENTE:** Execute a migration SQL no Supabase para o salvamento funcionar!
