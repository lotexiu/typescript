# Testes

```bash
pnpm test         # executa uma vez
pnpm test:watch   # modo watch
pnpm test:ui      # interface visual do Vitest
```

## Onde ficam

- `src/.test/*.test.ts` — testes de comportamento/cross-cutting.
- `*.test.ts` colocado ao lado do módulo que testa (ex.: `src/natives/object/proxy/ProxyHandler.test.ts`).
- `scripts/**/*.test.ts` — testes da própria tooling de build (analisador, gerador de índice/docs, validador).

Todos os três caminhos são pegos por `vitest.config.ts` (`include: ['src/**/*.test.ts', 'scripts/**/*.test.ts']`).

## Convenções

- `describe`/`it`/`expect` sempre importados de `'vitest'` — `globals: false`, não há globals ambient.
- Importe o módulo testado pelo alias/wrapper público (`import { MaskUtils } from '@ts/mask/utils'`), não pela implementação interna `_Foo` — assim o teste reflete como um consumidor real da lib usaria.
- `clearMocks: true` já é global — não precisa resetar mocks manualmente entre testes.

[← Voltar ao README](../../README.md)
