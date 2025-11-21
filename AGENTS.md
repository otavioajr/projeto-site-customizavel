# Repository Guidelines

## Project Structure & Module Organization
This repository is flat on purpose: the marketing/admin HTML entry points (`index.html`, `admin.html`, `confirmacao.html`, demo forms) share the same root as the Express uploader in `server.js`. Static assets (CSS, JS, media) live in `assets/`; keep runtime uploads in `uploads/`, which Express creates and serves but should stay untracked. Serverless adapters mirror the Express handlers in `api/`, while operational helpers (`dev-server.js`, `fast-dev.js`, shell scripts, Supabase SQL) sit beside the documentation set. Before launching the admin UI, copy `config.example.js` to `config.js` and inject the Supabase URL and anon key.

## Build, Test, and Development Commands
- `npm install` — restore dependencies after cloning or lockfile changes.
- `npm run dev` — Nodemon watch mode on `http://localhost:3001`, ideal for editing HTML + API code together.
- `npm start` — production-style Express run; used by deployment scripts such as `start.sh`.
- `npm run fast-dev` — static-only preview when the API is mocked or proxied elsewhere.
- `npm run preview` — `npx serve -p 3000`, mimicking CDN delivery for acceptance tests.
- `node verificar-supabase.js` — validates that required Supabase tables exist before publishing.

## Coding Style & Naming Conventions
Use 2-space indentation and keep the Node code in CommonJS (`require`, `module.exports`). Favor camelCase for JS symbols, kebab-case for public files (`test-supabase.html`), and SCREAMING_SNAKE_CASE for environment or config globals. Keep UI copy in pt-BR and group page-specific scripts next to their styles inside `assets/`.

## Testing Guidelines
There is no automated suite yet. Perform a manual pass every PR: `npm run dev`, open `http://localhost:3001/admin.html`, exercise inscription flows (`index.html` and `exemplo-inscricao-multipla.html`), upload at least one file to confirm size/type validation, and run `node verificar-supabase.js` plus `test-supabase.html` whenever the schema or keys change. Capture the exact steps in the PR body.

## Commit & Pull Request Guidelines
Commit subjects follow the Conventional Commit flavor already in the log (`feat:`, `refactor:`, `remove:`) and should stay under 72 chars. Each PR needs a short summary, testing evidence (commands + screenshots for UI tweaks), a pointer to any updated docs, and callouts for Supabase/config changes so reviewers can mirror them.

## Security & Configuration Notes
Never commit real Supabase keys or `config.js`; rely on workspace secrets and the checked-in `config.example.js`. Ensure `uploads/` remains ignored yet writable, and replicate the validation guardrails from `server.js` whenever you add endpoints (max 5 MB, MIME whitelist) to keep local and serverless paths consistent.
