# Scripts disponíveis

Executados com `pnpm run <script>` dentro de `packages/typescript`.

> **Use sempre `pnpm run <script>` (com `run`).** Especificamente pro `docs`: rodar `pnpm docs` sem o `run` faz o pnpm tratar isso como atalho pra abrir a homepage do pacote no navegador em vez de executar o script — confirmado na prática, mesmo esse atalho não aparecendo documentado em `pnpm help`.

| Script | O que faz |
|---|---|
| `build` | Gera `src/index.ts`, valida a estrutura do projeto e builda `dist/` (ESM + CJS + `.d.ts` empacotado) via Vite. |
| `dev` | A mesma coisa, em modo watch (`vite build --watch`) — inclusive detecta um arquivo novo criado durante a sessão, sem precisar reiniciar. |
| `clean` | Remove `dist/`. |
| `docs` | Regenera `docs/PROJECT.md`, `docs/API.md` e `docs/modules/*` a partir do JSDoc do código-fonte. |
| `commit` | Roda `build` + `test` + `docs` em sequência e só faz `git commit` (depois de `git add docs`) se todos passarem. |
| `test` | Roda a suíte de testes uma vez (Vitest). |
| `test:watch` | Roda a suíte em modo watch. |
| `test:ui` | Abre a interface visual do Vitest. |
| `debug` / `debug:watch` | Roda os testes com `--inspectBrk`, single-threaded e sem timeout — pra debugar com breakpoints. |
| `upd` / `upd-l` | Atualiza dependências do workspace (`pnpm up -r`) — a segunda variante (`--L`) ignora o range de versão declarado. |

[← Voltar ao README](../../README.md)
