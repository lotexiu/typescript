# typescript

Biblioteca utilitaria TypeScript do monorepo `@lotexiu`.

## Testes

Este pacote usa Vitest para validar os modulos de `src/` sem depender de um arquivo principal.

### Scripts

- `pnpm test`: executa os testes uma vez.
- `pnpm test:watch`: executa em modo watch.
- `pnpm test:ui`: abre a interface do Vitest.

### Estrutura recomendada

- Coloque testes em `src/.test/*.test.ts`.
- Importe modulos usando os aliases do pacote (`@ts/*`, `@tsn-*/*`) para testar como o codigo real eh consumido.

### Execucao

No pacote:

```bash
pnpm test
```

Da raiz do monorepo:

```bash
pnpm --filter @lotexiu/typescript test
```
