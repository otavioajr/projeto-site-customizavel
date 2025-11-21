# Plano para criar página de teste de inscrição com múltiplos participantes

## 1) Escopo e objetivos
- Criar uma página acessível via `p/multi-inscricao-teste` (slug configurável) que permita cadastrar uma inscrição principal contendo um ou mais participantes, armazenando tudo no Supabase (ou fallback localStorage).
- Reaproveitar layout/estilos existentes de páginas em `p/`, mantendo consistência com a cópia pt-BR e validações básicas.

## 2) Preparar base do projeto
- Confirmar `config.js` ativo com URL/KEY do Supabase (usar `.env.homol` se for o caso) e schema correto (`SUPABASE_SCHEMA`).
- Garantir que `assets/js/supabase.js` tenha métodos para inserir inscrição com payload de múltiplos participantes; se não, estender interface para receber um array de participantes junto a dados da inscrição principal.
- Definir tabela(s) no Supabase: `inscriptions` (dados do responsável + metadados) e `participants` (FK para inscription_id), com RLS permitindo inserts/selects anônimos conforme uso atual.

## 3) Estrutura da página
- Criar arquivo `p/multi-inscricao-teste.html` seguindo padrão das páginas existentes (head comum, import de `config.js`, `assets/js/supabase.js` e CSS base).
- Incluir formulário com seções:
  - Dados do responsável/inscrição (nome, email, telefone, acordo de termos).
  - Lista dinâmica de participantes (nome, documento, idade/faixa, campo extra genérico). Botão “Adicionar participante”, botão de remover linha.
  - Campos opcionais para observações/comentários gerais.
  - Checkbox de consentimento para uso de dados dos participantes.
- Prever área de feedback (alert/sucesso/erro) e placeholder para spinner/estado de envio.

## 4) Lógica de front-end
- Criar módulo JS dedicado (ex.: `assets/js/multi-inscricao.js`) importado pela página.
- Implementar gestão da lista de participantes em memória (array) com renderização para o DOM (template row clonável).
- Validar campos obrigatórios antes do submit: responsável + todos os campos requeridos dos participantes; impedir submit se lista de participantes estiver vazia.
- Tratar máscaras/formatação leve (telefone/doc) apenas se já houver utilitários no projeto; evitar dependências novas.

## 5) Persistência e integração
- No submit:
  - Desabilitar campos/botões e mostrar estado de envio.
  - Montar payload `{ responsavel: {...}, participantes: [...] }`.
  - Tentar insert no Supabase (tabelas `inscriptions` e `participants` em transação server-side; se apenas via client, fazer insert da inscrição e, na sequência, inserts dos participantes com FK).
  - Em caso de falha no Supabase, acionar fallback de `supabase.js` para `localStorage` mantendo formato equivalente.
- Salvar cópia local dos dados submetidos (opcional) para reuso em caso de erro/reenvio.

## 6) Fluxos e casos a contemplar
- Adicionar/remover participantes livremente antes do envio, garantindo reindexação/IDs das linhas.
- Bloquear envio sem participantes ou com campos obrigatórios vazios; mensagens de erro claras em pt-BR.
- LidAR com erros de rede/Supabase: exibir mensagem com sugestão de tentar novamente e manter dados em memória.
- Sucesso: limpar formulário/lista, mostrar confirmação (pode redirecionar para `confirmacao.html` com query params de resumo).
- Reenvio após erro: reabilitar formulário e permitir novo submit sem perda dos dados preenchidos.

## 7) Copy e UX
- Textos sucintos explicando que uma inscrição pode ter vários participantes.
- Botões claros: “Adicionar participante”, “Remover”, “Enviar inscrição”.
- Incluir avisos de privacidade/consentimento em pt-BR e links internos se existirem.

## 8) Observabilidade e logs
- Console: logs mínimos com tag do slug (`[multi-inscricao]`) para inspecionar payloads e erros.
- Opcional: registrar UUID de inscrição no localStorage para rastreio manual durante QA.

## 9) QA manual (ao desenvolver a página)
- Validar fluxo básico de múltiplos participantes, erro de validação, erro de rede/Supabase (simular offline), remoção de linhas e reenvio.
- Verificar que a tabela `participants` recebe todas as linhas associadas ao `inscription_id` correto.

## 10) Entrega
- Garantir inclusão do novo HTML e JS no repositório, sem chaves sensíveis.
- Adicionar instruções rápidas no `README` ou comentário no topo do JS se necessário para lembrar comandos (`npm run dev` / `npm run fast-dev`).
