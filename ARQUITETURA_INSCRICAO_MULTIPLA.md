# 🏗️ Arquitetura para Sistema de Inscrição Múltipla

## 📊 Análise do Sistema Atual

### Stack Tecnológico
- **Frontend**: HTML/CSS/JavaScript vanilla (sem frameworks)
- **Backend**: Node.js + Express (server.js para upload de imagens)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage para imagens
- **Deploy**: Vercel/Netlify

### Estrutura de Dados Atual

#### Tabela `inscriptions`
```sql
CREATE TABLE inscriptions (
  id UUID PRIMARY KEY,
  page_slug TEXT NOT NULL,
  form_data JSONB NOT NULL,  -- Armazena todos os dados do formulário
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP
);
```

#### Estrutura do `form_data` (JSONB)
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "cpf": "123.456.789-00",
  "_sequence": 1,
  "_group_size": 1,  // Já existe mas subutilizado
  // ... outros campos dinâmicos
}
```

### Fluxo Atual
1. **Admin** configura campos do formulário (tipos: text, email, tel, select, etc.)
2. **Usuário** preenche formulário com uma única pessoa
3. **Sistema** salva no banco com `_group_size: 1`
4. **Vagas** são contadas somando `_group_size` de todas inscrições

## 🎯 Requisitos da Nova Arquitetura

### 1. Campo de Quantidade de Inscritos
- Seletor numérico (1-10 pessoas)
- Validação contra vagas disponíveis
- Atualização dinâmica do formulário

### 2. Campos Repetíveis
- Alguns campos se repetem N vezes (nome, CPF, data nascimento)
- Outros permanecem únicos (dados do responsável)
- Interface dinâmica que se adapta à quantidade selecionada

### 3. Novo Tipo de Campo no Admin
- Tipo "repetível" ou "múltiplo"
- Configuração de quais subcampos são repetidos
- Agrupamento visual no admin

### 4. Salvamento no Banco
- Cada pessoa gera registro separado OU
- Array de pessoas dentro do JSONB
- Referência ao responsável

## 💡 Proposta de Solução

### Opção A: Múltiplos Registros (Recomendada)

#### Estrutura de Dados
```sql
-- Adicionar campos na tabela inscriptions
ALTER TABLE inscriptions ADD COLUMN group_id UUID;
ALTER TABLE inscriptions ADD COLUMN is_responsible BOOLEAN DEFAULT false;
ALTER TABLE inscriptions ADD COLUMN responsible_id UUID;
```

#### Exemplo de Dados
```json
// Registro 1 - Responsável
{
  "id": "uuid-1",
  "group_id": "group-uuid",
  "is_responsible": true,
  "responsible_id": null,
  "form_data": {
    "nome": "Maria Silva (Mãe)",
    "email": "maria@email.com",
    "telefone": "(11) 99999-9999",
    "cpf": "111.111.111-11",
    "_sequence": 1,
    "_participant_number": 1,
    "_total_participants": 3
  }
}

// Registro 2 - Filho 1
{
  "id": "uuid-2",
  "group_id": "group-uuid",
  "is_responsible": false,
  "responsible_id": "uuid-1",
  "form_data": {
    "nome": "Pedro Silva",
    "cpf": "222.222.222-22",
    "data_nascimento": "2010-05-15",
    "_sequence": 2,
    "_participant_number": 2,
    "_total_participants": 3
  }
}
```

#### Vantagens
✅ Cada pessoa tem registro próprio (melhor para relatórios)
✅ Facilita busca individual
✅ Permite cancelamento parcial
✅ Mantém histórico completo

### Opção B: Array no JSONB

#### Estrutura de Dados
```json
{
  "responsible": {
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "telefone": "(11) 99999-9999",
    "cpf": "111.111.111-11"
  },
  "participants": [
    {
      "nome": "Pedro Silva",
      "cpf": "222.222.222-22",
      "data_nascimento": "2010-05-15"
    },
    {
      "nome": "Ana Silva",
      "cpf": "333.333.333-33",
      "data_nascimento": "2012-08-20"
    }
  ],
  "_group_size": 3,
  "_sequence": 1
}
```

#### Vantagens
✅ Estrutura mais simples
✅ Uma única transação
✅ Menor alteração no código existente

## 🛠️ Implementação Proposta

### 1. Alterações no Admin (`admin.html` e `admin.js`)

#### Novo Tipo de Campo
```javascript
// Adicionar no admin.js
const fieldTypes = {
  text: 'Texto',
  email: 'Email',
  tel: 'Telefone',
  // ... tipos existentes
  repeatable_group: 'Grupo Repetível'  // NOVO
};

// Configuração de campo repetível
{
  id: 'participant_info',
  type: 'repeatable_group',
  label: 'Informações dos Participantes',
  repeatable_fields: [
    { id: 'nome', type: 'text', label: 'Nome Completo', required: true },
    { id: 'cpf', type: 'text', label: 'CPF', required: true },
    { id: 'data_nascimento', type: 'date', label: 'Data de Nascimento', required: true }
  ],
  non_repeatable_fields: [
    { id: 'responsavel_nome', type: 'text', label: 'Nome do Responsável', required: true },
    { id: 'responsavel_email', type: 'email', label: 'Email', required: true },
    { id: 'responsavel_telefone', type: 'tel', label: 'Telefone', required: true }
  ]
}
```

### 2. Interface do Usuário (`page.js`)

#### Seletor de Quantidade
```html
<div class="form-group">
  <label>Quantas pessoas você deseja inscrever?</label>
  <select id="participant-count" onchange="updateFormFields()">
    <option value="1">1 pessoa</option>
    <option value="2">2 pessoas</option>
    <option value="3">3 pessoas</option>
    <!-- até 10 -->
  </select>
</div>
```

#### Renderização Dinâmica
```javascript
function updateFormFields() {
  const count = parseInt(document.getElementById('participant-count').value);
  const container = document.getElementById('repeatable-fields-container');
  
  container.innerHTML = '';
  
  for (let i = 1; i <= count; i++) {
    const participantSection = document.createElement('div');
    participantSection.className = 'participant-section';
    participantSection.innerHTML = `
      <h3>Participante ${i}</h3>
      ${renderRepeatableFields(i)}
    `;
    container.appendChild(participantSection);
  }
}

function renderRepeatableFields(index) {
  return repeatableFields.map(field => `
    <div class="form-group">
      <label>${field.label} ${field.required ? '*' : ''}</label>
      <input 
        type="${field.type}" 
        name="${field.id}_${index}"
        ${field.required ? 'required' : ''}
      />
    </div>
  `).join('');
}
```

### 3. Salvamento no Banco (`supabase.js`)

```javascript
export async function saveMultipleInscriptions(pageSlug, formData, participantsData) {
  const groupId = generateUUID();
  const inscriptions = [];
  
  // Criar inscrição do responsável
  const responsibleInscription = {
    page_slug: pageSlug,
    group_id: groupId,
    is_responsible: true,
    form_data: {
      ...formData,
      _sequence: await getNextSequence(pageSlug),
      _participant_number: 1,
      _total_participants: participantsData.length + 1
    }
  };
  
  // Criar inscrições dos participantes
  for (let i = 0; i < participantsData.length; i++) {
    inscriptions.push({
      page_slug: pageSlug,
      group_id: groupId,
      is_responsible: false,
      responsible_id: null, // Será preenchido após inserir o responsável
      form_data: {
        ...participantsData[i],
        _sequence: await getNextSequence(pageSlug),
        _participant_number: i + 2,
        _total_participants: participantsData.length + 1
      }
    });
  }
  
  // Inserir tudo em uma transação
  const { data, error } = await supabase
    .from('inscriptions')
    .insert([responsibleInscription, ...inscriptions])
    .select();
    
  if (error) throw error;
  return data;
}
```

### 4. Validação de Vagas

```javascript
async function validateAvailableSlots(pageSlug, requestedSlots) {
  // Buscar total de vagas configuradas
  const { data: pageData } = await supabase
    .from('pages')
    .select('form_config')
    .eq('slug', pageSlug)
    .single();
    
  const maxParticipants = pageData?.form_config?.max_participants || 100;
  
  // Contar inscrições existentes
  const { count } = await supabase
    .from('inscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('page_slug', pageSlug);
    
  const availableSlots = maxParticipants - count;
  
  if (requestedSlots > availableSlots) {
    throw new Error(`Apenas ${availableSlots} vagas disponíveis`);
  }
  
  return true;
}
```

## 📋 Checklist de Implementação

### Fase 1: Backend
- [ ] Criar migration para novos campos na tabela
- [ ] Atualizar funções do Supabase para suportar grupos
- [ ] Implementar validação de vagas múltiplas
- [ ] Criar função de busca por grupo

### Fase 2: Admin
- [ ] Adicionar tipo de campo "repetível" no admin
- [ ] Interface para configurar campos repetíveis
- [ ] Visualização de grupos nas inscrições
- [ ] Exportação considerando grupos

### Fase 3: Frontend
- [ ] Seletor de quantidade de participantes
- [ ] Renderização dinâmica de campos
- [ ] Validação no cliente
- [ ] Feedback visual de vagas disponíveis

### Fase 4: Testes
- [ ] Testar inscrição única (compatibilidade)
- [ ] Testar inscrição múltipla
- [ ] Testar limites de vagas
- [ ] Testar cancelamentos parciais

## 🔄 Migração e Compatibilidade

### Dados Existentes
```javascript
// Script de migração para dados antigos
async function migrateExistingInscriptions() {
  const { data: inscriptions } = await supabase
    .from('inscriptions')
    .select('*')
    .is('group_id', null);
    
  for (const inscription of inscriptions) {
    await supabase
      .from('inscriptions')
      .update({
        group_id: generateUUID(),
        is_responsible: true,
        _participant_number: 1,
        _total_participants: 1
      })
      .eq('id', inscription.id);
  }
}
```

## 🎨 Interface Visual

### Desktop
```
┌─────────────────────────────────────┐
│ Quantas pessoas deseja inscrever?   │
│ [▼ 3 pessoas                      ] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ DADOS DO RESPONSÁVEL                │
│ Nome: [___________________________] │
│ Email: [__________________________] │
│ Telefone: [_______________________] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ PARTICIPANTE 1                      │
│ Nome: [___________________________] │
│ CPF: [____________________________] │
│ Data Nasc: [______________________] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ PARTICIPANTE 2                      │
│ Nome: [___________________________] │
│ CPF: [____________________________] │
│ Data Nasc: [______________________] │
└─────────────────────────────────────┘

[Adicionar Participante] [Enviar Inscrição]
```

### Mobile
- Accordion/collapse para cada participante
- Botão flutuante para adicionar
- Indicador de progresso (1/3 participantes)

## 📊 Relatórios e Visualização

### Lista de Inscrições no Admin
```
┌──────────────────────────────────────────────────┐
│ Grupo #1 - Maria Silva (3 participantes)        │
│ ├─ Pedro Silva - CPF: ***.***.**-**            │
│ ├─ Ana Silva - CPF: ***.***.**-**              │
│ └─ João Silva - CPF: ***.***.**-**             │
│ [Ver Detalhes] [Confirmar Todos] [Cancelar]    │
└──────────────────────────────────────────────────┘
```

## 🚀 Próximos Passos

1. **Decisão**: Escolher entre Opção A (múltiplos registros) ou B (array JSONB)
2. **Prototipação**: Criar POC com campos básicos
3. **Validação**: Testar com usuários reais
4. **Implementação**: Desenvolver em fases
5. **Deploy**: Atualizar produção com migração

## ⚠️ Considerações Importantes

### Performance
- Indexar `group_id` para busca rápida
- Limitar máximo de participantes por grupo (10)
- Cache de contagem de vagas

### Segurança
- Validar CPFs únicos por evento
- Rate limiting para evitar spam
- Sanitização de dados repetidos

### UX
- Salvar rascunho durante preenchimento
- Indicador visual de vagas restantes
- Confirmação antes de enviar múltiplas

## 📚 Referências

- [Documentação Supabase JSONB](https://supabase.com/docs/guides/database/json)
- [PostgreSQL Arrays vs JSONB](https://www.postgresql.org/docs/current/arrays.html)
- [Padrões de Design para Formulários Dinâmicos](https://www.nngroup.com/articles/web-form-design/)
