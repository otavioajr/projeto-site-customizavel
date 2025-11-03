# 🚀 Guia de Implementação Rápida - Inscrição Múltipla

## ✅ Progresso Atual

### Fase 1: Backend - CONCLUÍDO ✓
- [x] Migration SQL criada (`MIGRATION_INSCRICAO_MULTIPLA.sql`)
- [x] Funções do Supabase atualizadas (`supabase.js`)
- [x] Novas funções criadas:
  - `saveMultipleInscriptions()` - Salvar grupo de inscrições
  - `getInscriptionGroup()` - Buscar grupo específico
  - `getInscriptionGroups()` - Listar todos os grupos
  - `deleteInscriptionGroup()` - Deletar grupo completo
  - `updateGroupStatus()` - Atualizar status do grupo
  - `checkAvailableSlots()` - Verificar vagas disponíveis

### Fase 2: Admin - EM ANDAMENTO 🔄
- [ ] Adicionar tipo de campo repetível
- [ ] Interface de configuração
- [ ] Visualização de grupos nas inscrições

### Fase 3: Frontend - PENDENTE ⏳
- [ ] Renderização dinâmica de campos
- [ ] Integração com formulário

## 📋 Próximos Passos

### Passo 1: Executar Migration no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `MIGRATION_INSCRICAO_MULTIPLA.sql`
4. Execute o script
5. Verifique se os testes passaram (mensagens ✅)

**Comandos de verificação:**
```sql
-- Verificar se os campos foram adicionados
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inscriptions' 
AND column_name IN ('group_id', 'is_responsible', 'responsible_id', 'participant_number', 'total_participants');

-- Verificar se a view foi criada
SELECT * FROM v_inscription_groups LIMIT 1;

-- Testar função de verificação de vagas
SELECT * FROM check_available_slots('teste', 5, 50);
```

### Passo 2: Testar Funções do Supabase

Abra o console do navegador em `/admin.html` e teste:

```javascript
// Importar funções
import { 
  saveMultipleInscriptions, 
  getInscriptionGroups,
  checkAvailableSlots 
} from './assets/js/supabase.js';

// Teste 1: Verificar vagas
const availability = await checkAvailableSlots('trilha-teste', 3, 50);
console.log('Vagas:', availability);

// Teste 2: Salvar inscrição múltipla
const responsibleData = {
  nome: 'Maria Silva',
  email: 'maria@email.com',
  telefone: '(11) 99999-9999',
  cpf: '111.111.111-11'
};

const participantsData = [
  {
    nome: 'Pedro Silva',
    cpf: '222.222.222-22',
    data_nascimento: '2010-05-15'
  },
  {
    nome: 'Ana Silva',
    cpf: '333.333.333-33',
    data_nascimento: '2012-08-20'
  }
];

const result = await saveMultipleInscriptions(
  'trilha-teste',
  responsibleData,
  participantsData,
  { maxParticipants: 50 }
);

console.log('Resultado:', result);

// Teste 3: Buscar grupos
const groups = await getInscriptionGroups('trilha-teste');
console.log('Grupos:', groups);
```

### Passo 3: Configurar Tipo de Campo Repetível no Admin

Adicione esta configuração no `form_config` de uma página:

```json
{
  "title": "Inscrição para Trilha",
  "description": "Formulário de inscrição múltipla",
  "max_participants": 50,
  "enable_multiple_registration": true,
  "max_participants_per_group": 10,
  "fields": [
    {
      "id": "responsible_section",
      "type": "section",
      "label": "Dados do Responsável",
      "fields": [
        {
          "id": "responsible_name",
          "type": "text",
          "label": "Nome Completo",
          "required": true
        },
        {
          "id": "responsible_email",
          "type": "email",
          "label": "Email",
          "required": true
        },
        {
          "id": "responsible_phone",
          "type": "tel",
          "label": "Telefone",
          "required": true
        }
      ]
    },
    {
      "id": "participants_section",
      "type": "repeatable_group",
      "label": "Participantes",
      "repeatable": true,
      "fields": [
        {
          "id": "nome",
          "type": "text",
          "label": "Nome Completo",
          "required": true
        },
        {
          "id": "cpf",
          "type": "text",
          "label": "CPF",
          "required": true
        },
        {
          "id": "data_nascimento",
          "type": "date",
          "label": "Data de Nascimento",
          "required": true
        }
      ]
    }
  ]
}
```

### Passo 4: Testar com Exemplo Funcional

1. Abra `exemplo-inscricao-multipla.html` no navegador
2. Teste a interface de inscrição múltipla
3. Verifique:
   - Seleção de quantidade
   - Adição/remoção de participantes
   - Validação de campos
   - Cálculo de valores

### Passo 5: Integrar com Sistema Real

Modifique `page.js` para usar as novas funções:

```javascript
// No handleFormSubmit de page.js
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const participantCount = parseInt(document.getElementById('participant-count')?.value || 1);
  
  if (participantCount > 1) {
    // Inscrição múltipla
    const responsibleData = extractResponsibleData(formData);
    const participantsData = extractParticipantsData(formData, participantCount);
    
    const result = await saveMultipleInscriptions(
      page.slug,
      responsibleData,
      participantsData,
      {
        sessionSelections: sessionSelections,
        maxParticipants: config.max_participants
      }
    );
    
    if (result.success) {
      window.location.href = `/confirmacao.html?group=${result.groupId}`;
    }
  } else {
    // Inscrição única (código existente)
    await saveInscription(page.slug, data, options);
  }
}
```

## 🔧 Funções Auxiliares Necessárias

### Extrair Dados do Responsável
```javascript
function extractResponsibleData(formData) {
  const data = {};
  for (let [key, value] of formData.entries()) {
    if (key.startsWith('responsible_')) {
      data[key.replace('responsible_', '')] = value;
    }
  }
  return data;
}
```

### Extrair Dados dos Participantes
```javascript
function extractParticipantsData(formData, count) {
  const participants = [];
  
  for (let i = 1; i <= count; i++) {
    const participant = {};
    for (let [key, value] of formData.entries()) {
      if (key.startsWith(`participant_${i}_`)) {
        const fieldName = key.replace(`participant_${i}_`, '');
        participant[fieldName] = value;
      }
    }
    if (Object.keys(participant).length > 0) {
      participants.push(participant);
    }
  }
  
  return participants;
}
```

## 📊 Visualização de Grupos no Admin

Adicione esta função em `admin.js`:

```javascript
async function renderInscriptionGroups(pageSlug) {
  const groups = await getInscriptionGroups(pageSlug);
  const container = document.getElementById('inscriptions-list');
  
  container.innerHTML = groups.map(group => `
    <div class="inscription-group-card">
      <div class="group-header">
        <h4>Grupo #${group.group_id.substring(0, 8)}</h4>
        <span class="group-badge">${group.total_participants} participantes</span>
      </div>
      
      <div class="group-responsible">
        <strong>Responsável:</strong> ${group.responsible_name}<br>
        <strong>Email:</strong> ${group.responsible_email}<br>
        <strong>Telefone:</strong> ${group.responsible_phone}
      </div>
      
      <div class="group-participants">
        <strong>Participantes:</strong>
        <ul>
          ${group.participants.map(p => `
            <li>${p.form_data.nome || 'Sem nome'}</li>
          `).join('')}
        </ul>
      </div>
      
      <div class="group-actions">
        <button onclick="viewGroupDetails('${group.group_id}')">Ver Detalhes</button>
        <button onclick="confirmGroup('${group.group_id}')">Confirmar Todos</button>
        <button onclick="deleteGroup('${group.group_id}')">Cancelar Grupo</button>
      </div>
    </div>
  `).join('');
}
```

## 🎨 Estilos CSS para Grupos

Adicione em `admin.html` ou CSS:

```css
.inscription-group-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.group-badge {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
}

.group-responsible {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.group-participants ul {
  list-style: none;
  padding: 0;
}

.group-participants li {
  padding: 8px;
  border-bottom: 1px solid #e9ecef;
}

.group-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.group-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}
```

## 🧪 Testes Recomendados

### Teste 1: Inscrição Única
- Criar inscrição com 1 participante
- Verificar se `group_id` foi criado
- Verificar se `is_responsible = true`

### Teste 2: Inscrição Múltipla (2 pessoas)
- Criar inscrição com 2 participantes
- Verificar se 2 registros foram criados
- Verificar se `group_id` é o mesmo
- Verificar se `responsible_id` está correto

### Teste 3: Inscrição Múltipla (5+ pessoas)
- Criar inscrição com 5 participantes
- Verificar contagem de vagas
- Verificar ordenação por `participant_number`

### Teste 4: Validação de Vagas
- Tentar inscrever mais pessoas do que vagas disponíveis
- Verificar se erro é retornado
- Verificar mensagem de erro

### Teste 5: Deletar Grupo
- Criar grupo com 3 participantes
- Deletar grupo completo
- Verificar se todos os registros foram removidos

### Teste 6: Atualizar Status
- Criar grupo
- Atualizar status para "confirmed"
- Verificar se todos os participantes foram atualizados

## 📝 Checklist de Validação

- [ ] Migration executada com sucesso no Supabase
- [ ] Todos os campos foram adicionados
- [ ] Índices foram criados
- [ ] Funções SQL estão funcionando
- [ ] View `v_inscription_groups` está acessível
- [ ] Funções JavaScript estão importadas corretamente
- [ ] Teste de inscrição única funciona
- [ ] Teste de inscrição múltipla funciona
- [ ] Validação de vagas funciona
- [ ] Visualização de grupos no admin funciona
- [ ] Deleção de grupos funciona
- [ ] Atualização de status funciona

## 🐛 Troubleshooting

### Erro: "function check_available_slots does not exist"
**Solução:** Execute a migration SQL novamente

### Erro: "column group_id does not exist"
**Solução:** Verifique se a migration foi executada corretamente

### Erro: "Cannot read property 'group_id' of undefined"
**Solução:** Verifique se os dados estão sendo retornados corretamente do Supabase

### Inscrições antigas não aparecem
**Solução:** Execute o UPDATE da migration para adicionar `group_id` aos registros antigos

### View não retorna dados
**Solução:** Verifique se há inscrições no banco. A view agrupa por `group_id`

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Verifique os logs do Supabase
3. Revise a documentação em `ARQUITETURA_INSCRICAO_MULTIPLA.md`
4. Teste com o exemplo em `exemplo-inscricao-multipla.html`

## 🎯 Próximas Melhorias

- [ ] Adicionar limite de participantes por grupo configurável
- [ ] Implementar desconto para grupos
- [ ] Adicionar campo de observações por participante
- [ ] Exportar grupos para Excel/CSV
- [ ] Enviar email de confirmação para todos os participantes
- [ ] Dashboard com estatísticas de grupos
- [ ] Filtros avançados (por tamanho de grupo, status, etc.)
