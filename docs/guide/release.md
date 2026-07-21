# Versionamento, tags e release

O fluxo até o pacote virar uma tag/release no GitHub é **100% automático** — nenhuma etapa manual, nenhuma label pra escolher, nenhum arquivo pra gerar antes de abrir a PR. A publicação no npm é a única etapa manual, de propósito.

## 1. PR aberta/atualizada → `.github/workflows/pr-analysis.yml`

Roda em toda PR contra `master` (mesmo repositório, sem suporte a fork):

- Faz `pnpm build` + `pnpm test` de verdade — é daí que vem a label `build-passed`/`build-failed`, nunca de algo autodeclarado.
- Roda `pnpm run changes:check`; se o resultado não bater com o que está commitado (ou não existir ainda), roda `pnpm run changes` de novo e **commita o resultado direto na branch da PR** (`chore: update .changes`). Você nunca precisa rodar isso localmente nem lembrar de commitar nada — o diff da API pública (`scripts/tools/api-snapshot.ts` + `api-diff.ts`, comparando com o merge-base de `master` via `git worktree`, sem clonar nada externo) decide tudo sozinho.
- Aplica as labels calculadas: exatamente uma de `major`/`minor`/`patch`, zero ou mais de `feat`/`fix`/`refact`/`docs`/`internal` (podem coexistir — ex. `docs`+`refact` quando parte dos arquivos tocados só teve comentário mudado e outra parte teve código real mudado), e `build-passed`/`build-failed`.
- Comenta um resumo na PR com essas tags + o `.changes/CHANGELOG.md` gerado.

`clean-code` existe como label mas nunca é aplicada automaticamente — é só pra você marcar manualmente se quiser, depois.

## 2. Merge na `master` → `pr-merge-actions.yml`

- `merge-gate`: bloqueia o merge se faltar a label `build-passed` (ou tiver `build-failed`), se não tiver nenhuma label de impacto, ou se `.changes/api-changes.json`/`CHANGELOG.md` não estiverem na PR — na prática isso só falharia se `pr-analysis.yml` não tiver rodado.
- `bump-version-and-tag` (só quando a PR fecha com `merged: true`): lê o impacto direto de `.changes/api-changes.json` (já verificado antes do merge), bumpa `package.json` reutilizando `bumpVersion()` de `scripts/tools/api-diff.ts` (mesma função, sem reimplementar a conta em outro lugar), commita na `master` e cria/empurra a tag anotada `vX.Y.Z` com metadados da PR + o changelog embutidos.

## 3. Tag `v*` empurrada → GitHub Release + aliases (automáticos, sem mudança nessa parte)

- `release-actions.yml` cria/atualiza a GitHub Release (corpo = `.changes/CHANGELOG.md`; prerelease se a label `test` — manual, opcional — estava presente no merge). Só processa tags `vX.Y.Z` canônicas, ignora as tags-alias (`v2`, `v2.1`) que o próximo workflow empurra.
- `tag-aliases-actions.yml` atualiza as tags flutuantes `latest`, `vMAJOR` e `vMAJOR.MINOR`.

## 4. Publicação no npm — a única etapa manual

`npmjs-release.yml` não dispara sozinho (`workflow_dispatch`, não `on: release: published`):

- GitHub → aba **Actions** → **NPMJS Release** → **Run workflow**, informando `tag` (ex. `v2.1.0`) e `npm_dist_tag` (`latest`/`test`).
- Ou via `gh` CLI: `gh workflow run npmjs-release.yml -f tag=v2.1.0 -f npm_dist_tag=latest`.

## Rodando `generate-changes` manualmente (opcional, só por curiosidade/debug)

Nunca é necessário — a CI já cuida disso — mas dá pra rodar localmente:

```bash
pnpm run changes          # gera .changes/api-changes.json + CHANGELOG.md comparando com master
pnpm run changes --base outra-branch
pnpm run changes:check    # recalcula e compara com o que está commitado, sem escrever nada
```

[← Voltar ao README](../../README.md)
