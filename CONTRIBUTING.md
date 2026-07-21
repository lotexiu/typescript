# Contribuindo

Guia rápido pra quem for mexer no código. Para o racional arquitetural completo — por que cada coisa é do jeito que é, histórico de decisões — veja [`CLAUDE.md`](CLAUDE.md); este arquivo é só o essencial pra começar.

## Antes de tudo

```bash
pnpm install
pnpm build   # gera src/index.ts e valida a estrutura do projeto
pnpm test    # roda a suíte de testes
```

## Convenções principais

- **Nunca edite `src/index.ts` à mão.** Ele é gerado a cada build a partir do que existe em `src/**` — qualquer alteração manual é sobrescrita no próximo `pnpm build`/`pnpm dev`. Se um export está errado ou faltando, corrija o arquivo de origem (nome, `export`, tag de JSDoc), não o índice.
- **Cada módulo em `src/` segue papéis por nome de arquivo, não por feature:** `types.ts` (tipos puros), `implementations.ts` (lógica real — geralmente uma classe interna `_Foo` marcada `@internal`), `utils.ts` (a classe pública `FooUtils`, que só delega pra `_Foo`), `model.ts`/`declarations.ts` (classes com estado, singletons, constantes).
- **A divisão `_Foo`/`FooUtils`** vale pra namespaces estáticos sem estado (`Mask`, `Object`, `String`...), não pra classes instanciáveis com estado (`ValueHistory`, `PathMap`, `ValueCell`...) — essas ficam expostas direto, sem wrapper.
- **Toda declaração pública precisa de JSDoc.** `pnpm build` avisa (não falha o build) quando um export sem tag `@internal` não tem descrição.
- **Nunca chame um método-irmão via `this` dentro de uma classe estática** (`_Foo.metodo()`, nunca `this.metodo()`) — já causou bugs reais em produção quando o método era acessado desestruturado ou via `FooUtils` (`this` passa a apontar pro wrapper, não pra `_Foo`).

## Testes

Veja [docs/guide/testing.md](docs/guide/testing.md).

## Documentação gerada

`pnpm run docs` regenera `docs/PROJECT.md`, `docs/API.md` e `docs/modules/*` a partir do JSDoc do código-fonte — não edite esses arquivos à mão, edite o JSDoc na origem e rode `pnpm run docs` de novo. **Use sempre `pnpm run docs` (com `run`), nunca `pnpm docs` sozinho** — o pnpm trata `docs` como atalho pra abrir a homepage do pacote no navegador em vez de rodar o script.

## Pull requests

Não precisa de nada manual além de abrir o PR normalmente — nem título/descrição caprichados, nem rodar nada antes. `.github/workflows/pr-analysis.yml` builda e testa de verdade, calcula o diff da API pública sozinho (sem clonar nada externo) e já commita `.changes/*` e aplica as labels de impacto/tipo direto na PR.

## Release e publicação

Merge na `master` já dispara bump de versão, tag e GitHub Release automaticamente. **A publicação no npm é manual** — veja [docs/guide/release.md](docs/guide/release.md) pro fluxo completo e como disparar o `workflow_dispatch` do `npmjs-release.yml`.
