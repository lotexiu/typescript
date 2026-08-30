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
- **Toda declaração pública deveria ter JSDoc** (não é mais enforçado por ferramenta — o validator foi removido).
- **Nunca chame um método-irmão via `this` dentro de uma classe estática** (`_Foo.metodo()`, nunca `this.metodo()`) — já causou bugs reais em produção quando o método era acessado desestruturado ou via `FooUtils` (`this` passa a apontar pro wrapper, não pra `_Foo`).

## Testes

Veja [docs/guide/testing.md](docs/guide/testing.md).

## Documentação gerada

`pnpm docs:ast` regenera `docs/EXTRACTED.md` (extração sintática via Lexer/Grammar da própria lib) — não edite à mão. O gerador antigo baseado no compiler API (`docs/API.md`/`PROJECT.md`/`modules/`) foi removido.

## Pull requests

Abra o PR normalmente. O workflow builda e testa de verdade e aplica as labels `build-passed`/`build-failed`; o `merge-gate` bloqueia enquanto não houver `build-passed`. (A análise automática de diff de API — `pr-analysis.yml`, labels de impacto, `.changes/*` — foi removida.)

## Release e publicação

Bump de versão em `package.json` e criação da tag `vX.Y.Z` são **manuais** — veja [docs/guide/release.md](docs/guide/release.md). A publicação no npm é o `workflow_dispatch` do `npmjs-release.yml`.
