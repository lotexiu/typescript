# Testes

```bash
pnpm test         # executa uma vez (--passWithNoTests)
pnpm test:watch   # modo watch
pnpm test:ui      # interface visual do Vitest
```

## Estado atual

**Não há nenhum `*.test.ts` no repo hoje, de propósito** — as suites da tooling de build foram
deletadas junto com os scripts que testavam, e `Mask`/`_String`/`Parser` etc. nunca tiveram
suite própria. Voltam quando a forma nova estabilizar (ver `CLAUDE.md`).

`vitest.config.ts` ainda coleta `src/**/*.test.ts` e `scripts/**/*.test.ts` — é só criar o
arquivo no lugar certo.

## Convenções

- `describe`/`it`/`expect` sempre importados de `'vitest'` — `globals: false`.
- Importe o módulo testado pelo alias/wrapper público (`import { StringUtils } from '@ts/natives/string/utils'`), não pela implementação interna.
- `clearMocks: true` é global — não resetar mocks manualmente.

[← Voltar ao README](../../README.md)
