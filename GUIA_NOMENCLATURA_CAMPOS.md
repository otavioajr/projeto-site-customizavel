# 📝 Guia de Nomenclatura de Campos - Inscrição Múltipla

## 🎯 Como Funciona a Detecção Automática

O sistema detecta **automaticamente** quais campos devem ser repetidos para cada participante baseado em **palavras-chave no label** do campo.

---

## 🔑 Palavras-Chave Mágicas

### ✅ Campos REPETÍVEIS (para cada participante)

Use estas palavras no **label** do campo:
- **PARTICIPANTE** (singular ou plural)
- **PESSOA** (singular ou plural)

**Exemplos corretos:**
```
✅ "Nome do Participante"
✅ "CPF do Participante"  
✅ "Idade do Participante"
✅ "Data de Nascimento da Pessoa"
✅ "Tamanho da Camiseta do Participante"
✅ "Restrições Alimentares da Pessoa"
✅ "RG do Participante"
```

### ✅ Campos ÚNICOS (apenas responsável)

Use estas palavras no **label** do campo:
- **RESPONSÁVEL** (com ou sem acento)
- **ORGANIZADOR**

**Exemplos corretos:**
```
✅ "Nome do Responsável"
✅ "Email do Responsável"
✅ "Telefone do Responsável"
✅ "CPF do Organizador"
✅ "Endereço do Responsável"
```

### ✅ Campos SEM palavra-chave (default = único)

Se o label NÃO tem nenhuma palavra-chave, o campo será **único** (do responsável).

**Exemplos:**
```
✅ "Email de Contato" → único (responsável)
✅ "Telefone" → único (responsável)
✅ "Observações Gerais" → único (responsável)
✅ "Como conheceu o evento?" → único (responsável)
✅ "Forma de Pagamento" → único (responsável)
```

---

## 📋 Exemplos Práticos

### Exemplo 1: Acampamento Infantil

**Campos do Responsável (únicos):**
- "Nome do Responsável"
- "Email do Responsável"
- "Telefone do Responsável"
- "CPF do Responsável"
- "Endereço Completo"
- "Forma de Pagamento"
- "Observações Gerais"

**Campos dos Participantes (repetidos):**
- "Nome do Participante"
- "Idade do Participante"
- "Data de Nascimento do Participante"
- "RG do Participante"
- "Tamanho da Camiseta do Participante"
- "Restrições Alimentares do Participante"
- "Medicação Contínua do Participante"

### Exemplo 2: Trilha em Grupo

**Campos do Responsável:**
- "Nome do Organizador"
- "Email do Organizador"
- "Telefone do Organizador"
- "Como conheceu a trilha?"
- "Experiência em trilhas"

**Campos dos Participantes:**
- "Nome da Pessoa"
- "CPF da Pessoa"
- "Data de Nascimento da Pessoa"
- "Nível de Condicionamento da Pessoa"
- "Problemas de Saúde da Pessoa"

### Exemplo 3: Evento Corporativo

**Campos do Responsável:**
- "Nome do Responsável"
- "Email do Responsável"
- "Nome da Empresa"
- "CNPJ"
- "Centro de Custo"
- "Forma de Faturamento"

**Campos dos Participantes:**
- "Nome do Participante"
- "CPF do Participante"
- "Cargo do Participante"
- "Email do Participante"
- "Tamanho do Uniforme do Participante"

---

## 🎨 Interface Resultante

### Quando você configura assim:
```
Campos:
1. "Nome do Responsável" → único
2. "Email do Responsável" → único
3. "Telefone do Responsável" → único
4. "Nome do Participante" → repetível
5. "CPF do Participante" → repetível
6. "Idade do Participante" → repetível
```

### O usuário vê:
```
┌─────────────────────────────────────┐
│ Quantas pessoas vai inscrever?      │
│ [Selecione: 3 pessoas ▼]            │
└─────────────────────────────────────┘

┌─── DADOS DO RESPONSÁVEL ───────────┐
│ Nome do Responsável: [___________] │
│ Email do Responsável: [__________] │
│ Telefone do Responsável: [_______] │
└─────────────────────────────────────┘

┌─── PARTICIPANTE 1 ─────────────────┐
│ Nome do Participante: [___________]│
│ CPF do Participante: [____________]│
│ Idade do Participante: [_________] │
└─────────────────────────────────────┘

┌─── PARTICIPANTE 2 ─────────────────┐
│ Nome do Participante: [___________]│
│ CPF do Participante: [____________]│
│ Idade do Participante: [_________] │
└─────────────────────────────────────┘

┌─── PARTICIPANTE 3 ─────────────────┐
│ Nome do Participante: [___________]│
│ CPF do Participante: [____________]│
│ Idade do Participante: [_________] │
└─────────────────────────────────────┘
```

---

## 🔍 Detalhes Técnicos

### Como a Detecção Funciona

```javascript
// 1. Pega o label do campo
const label = "Nome do Participante"

// 2. Normaliza (remove acentos, lowercase)
const normalized = "nome do participante"

// 3. Verifica palavras-chave
if (label contém "participante" ou "pessoa") {
  → CAMPO REPETÍVEL ✅
}
else if (label contém "responsável" ou "organizador") {
  → CAMPO ÚNICO ✅
}
else {
  → CAMPO ÚNICO (default) ✅
}
```

### Palavras Aceitas (todas variações)

**Repetíveis:**
- participante
- participantes
- pessoa
- pessoas

**Únicos:**
- responsável
- responsavel (sem acento)
- responsáveis
- organizador
- organizadores

### Case Insensitive
```
✅ "PARTICIPANTE" funciona
✅ "Participante" funciona
✅ "participante" funciona
✅ "PaRtIcIpAnTe" funciona
```

### Ignora Acentos
```
✅ "Responsável" funciona
✅ "Responsavel" funciona
✅ "RESPONSAVEL" funciona
```

---

## ⚠️ Erros Comuns a Evitar

### ❌ ERRADO: Sem palavra-chave quando deveria repetir
```
❌ "Nome" → será único (não repete)
❌ "CPF" → será único (não repete)
❌ "Idade" → será único (não repete)
```

**Correto:**
```
✅ "Nome do Participante"
✅ "CPF do Participante"
✅ "Idade do Participante"
```

### ❌ ERRADO: Palavra-chave errada
```
❌ "Nome da Criança" → será único (não tem palavra-chave)
❌ "CPF do Inscrito" → será único (não tem palavra-chave)
```

**Correto:**
```
✅ "Nome do Participante" ou "Nome da Pessoa"
✅ "CPF do Participante" ou "CPF da Pessoa"
```

### ❌ ERRADO: Misturando palavras
```
❌ "Responsável pelo Participante" → será único (responsável tem prioridade)
```

**Correto:**
```
✅ "Nome do Responsável" → único
✅ "Nome do Participante" → repetível
```

---

## 💡 Dicas Pro

### Dica 1: Use Templates Consistentes
Padronize seus labels para facilitar:
```
Template:
- "[Campo] do Responsável"
- "[Campo] do Participante"

Exemplos:
✅ "Nome do Responsável" / "Nome do Participante"
✅ "Email do Responsável" / "Email do Participante"
✅ "CPF do Responsável" / "CPF do Participante"
```

### Dica 2: Campos de Pagamento = Responsável
Pagamento sempre é único:
```
✅ "Forma de Pagamento"
✅ "Número do Cartão"
✅ "Chave PIX do Responsável"
```

### Dica 3: Sessões/Baterias
Campos de sessão sempre são do grupo (todos na mesma):
```
✅ "Selecione a Bateria" → tipo: sessions
```

### Dica 4: Observações
Distingua entre geral e individual:
```
✅ "Observações Gerais" → único
✅ "Observações do Participante" → repetível
```

---

## 📊 Checklist de Configuração

Ao criar um formulário de inscrição múltipla:

- [ ] ✅ Marcar "Permitir inscrição em grupo" no admin
- [ ] ✅ Configurar min/max participantes (ex: 1 a 10)
- [ ] ✅ Adicionar campos do responsável com "Responsável" no label
- [ ] ✅ Adicionar campos dos participantes com "Participante" no label
- [ ] ✅ Testar com 1 pessoa (modo individual)
- [ ] ✅ Testar com 3+ pessoas (modo grupo)
- [ ] ✅ Verificar que campos corretos repetem
- [ ] ✅ Verificar que dados salvam corretamente

---

## 🧪 Como Testar Rapidamente

### Teste 1: Criar campos
```
No admin:
1. "Email do Responsável" → deve aparecer 1x
2. "Nome do Participante" → deve repetir
```

### Teste 2: Verificar interface
```
No formulário público:
1. Selecione 3 pessoas
2. Deve ver:
   - 1 seção "Responsável"
   - 3 seções "Participante 1, 2, 3"
```

### Teste 3: Verificar dados
```
Após enviar:
1. Abra Supabase
2. Veja a tabela inscriptions
3. Deve ter 3 registros com mesmo group_id
```

---

## 🎯 Resumo Rápido

**Regra de Ouro:**
```
📌 Quer que o campo REPITA para cada pessoa?
   → Coloque "PARTICIPANTE" ou "PESSOA" no label

📌 Quer que o campo apareça apenas 1 VEZ?
   → Coloque "RESPONSÁVEL" no label OU não use palavra-chave

📌 Sessões/Baterias?
   → Use tipo "sessions" (sempre do grupo)
```

**É só isso! Simples e poderoso.** 🚀

---

## 📞 Exemplos Rápidos para Copiar/Colar

### Dados Básicos do Responsável
```
✅ Nome do Responsável
✅ Email do Responsável
✅ Telefone do Responsável
✅ CPF do Responsável
✅ Endereço Completo
```

### Dados Básicos do Participante
```
✅ Nome do Participante
✅ CPF do Participante
✅ RG do Participante
✅ Data de Nascimento do Participante
✅ Idade do Participante
```

### Dados Específicos - Esporte/Trilha
```
Responsável:
✅ Experiência em Trilhas
✅ Forma de Pagamento

Participante:
✅ Nível de Condicionamento do Participante
✅ Problemas de Saúde do Participante
✅ Tamanho da Camiseta do Participante
```

### Dados Específicos - Evento Infantil
```
Responsável:
✅ Grau de Parentesco
✅ Telefone de Emergência

Participante:
✅ Idade do Participante
✅ Alergias do Participante
✅ Medicação Contínua do Participante
✅ Restrições Alimentares do Participante
```

---

**Pronto! Agora você sabe criar formulários perfeitos de inscrição múltipla!** 🎉
