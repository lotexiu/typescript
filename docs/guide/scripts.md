# Scripts disponíveis

Executados com `pnpm run <script>` dentro de `packages/typescript`.

| Script | O que faz |
|---|---|
| `build` | Gera `src/index.ts` (via `scripts/doc/index-gen.ts`) e builda `dist/` (ESM + CJS + `.d.ts` empacotado) via Vite. |
| `clean` | Remove `dist/`. |
| `test` | Roda o Vitest uma vez (`--passWithNoTests` — não há suites hoje, de propósito). |
| `test:watch` | Vitest em modo watch. |
| `test:ui` | Interface visual do Vitest. |
| `docs:ast` | Regenera `docs/EXTRACTED.md` — extração sintática de cada arquivo via Lexer/Grammar da própria lib. |

Watch mode do build: `vite build --watch` direto (`scripts/vite-plugin.ts` regenera `src/index.ts` e detecta arquivo novo).

[← Voltar ao README](../../README.md)
