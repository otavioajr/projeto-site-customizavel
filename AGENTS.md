# Repository Guidelines

## Snapshot do projeto (estado atual)
- HTMLs principais (`index.html`, `admin.html`, `confirmacao.html`, `adicionar-exemplo.html`) ficam na raiz; JS/CSS em `assets/`; templates de página em `p/`.
- `server.js` roda Express no `localhost:3001`, servindo os HTMLs e uma API simples de upload local para `uploads/` (pasta ignorada, criada em runtime). Limite de 5MB e tipos jpg/png/gif/webp.
- Front-end é vanilla ES modules. `assets/js/supabase.js` concentra toda a integração com Supabase (pages, home_content, inscriptions, storage) e faz fallback para `localStorage` se o Supabase falhar.
- Uploads de imagens usados pelo admin são feitos via Supabase Storage pelas funções de `supabase.js`; a rota `/api/upload` é principalmente para uso local/offline.
- Configuração: use `config.example.js` como base para `config.js` (gitignored). Variáveis também podem vir de `.env`, `.env.homol`, `.env.production`; `SUPABASE_SCHEMA` alterna entre `homol` e `public`. Há valores padrão de Supabase hardcoded em `supabase.js` apenas para desenvolvimento—troque para env reais antes de produção.
- Não há build nem CI; não existe suíte de testes automatizados. Lockfiles presentes: `package-lock.json` e `package-lock 2.json`.

## Comandos de uso real
- `npm install`
- `npm run dev` (nodemon via `dev-server.js`, porta 3001)
- `npm run dev:homol` / `npm run dev:prod` (carrega `.env.homol` / `.env.production`)
- `npm start` (Express simples)
- `npm run fast-dev` (preview estático sem API)
- `npm run preview` (`npx serve -p 3000`)
- `npm run vercel-dev` (precisa vercel CLI)
- `node verificar-supabase.js` para checar tabelas/credenciais
- `./switch-env.sh current` para ver ambiente ativo

## Estilo e convenções
- Identação de 2 espaços; backend em CommonJS; frontend em ES modules.
- Texto/copy em pt-BR. JS em camelCase, arquivos públicos em kebab-case, envs em SCREAMING_SNAKE_CASE.
- Agrupe scripts/estilos específicos de página dentro de `assets/`; evite adicionar frameworks/bundlers.

## Testes e QA (manual)
- Não há testes automáticos: rode `npm run dev` (ou `npm run dev:homol`), abra `/admin.html` e `/`.
- Verifique se config/env estão sendo injetados (console mostra schema e URL do Supabase). Use `test-supabase.html` ou `node verificar-supabase.js` quando mexer em schema/keys.
- Crie/edite páginas no admin e confirme persistência no Supabase; garanta que o fallback de `localStorage` não está sendo disparado sem necessidade.
- Aba de imagens: faça upload para o Storage via admin e valide se a URL pública carrega; opcionalmente teste `/api/upload` para garantir limite/mime locais.
- Submeta um formulário de inscrição (página em `p/slug`) e confira a linha no Supabase; teste sessões/capacidade se usar inscrição múltipla.
- Priorize testar em ambiente `homol` antes de apontar para produção.

## Segurança e configuração
- Não commitar chaves reais do Supabase nem `.env*`/`config.js`. O `config.js` local deve usar credenciais que possam ser descartadas.
- Buckets do Storage precisam de leitura pública; tabelas exigem políticas RLS que permitam inserts/selects anônimos conforme uso.
- Mantenha `uploads/` ignorada porém gravável; ao criar novas rotas, replique validação de tamanho/tipo do `server.js`.
- Revisar logs de `server.js`/`supabase.js` para confirmar qual schema (`SUPABASE_SCHEMA`) está ativo.

## Branches e PRs
- Trabalhe em `homol` (staging) antes de subir para produção (`main`); não há CI para prevenir slips.
- PRs devem listar comandos/testes manuais executados e destacar qualquer mudança de Supabase/config para que revisores possam replicar.
