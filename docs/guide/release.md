# Versionamento, tags e release

> **Nota (2026-08):** o versionamento semântico automático por diff de API pública foi
> removido junto com `scripts/analyzer/` e `scripts/tools/` (`api-snapshot`/`api-diff`/
> `api-signature`/`generate-changes`) e o workflow `pr-analysis.yml`. Bump de versão e
> criação de tag voltaram a ser **manuais**. O texto abaixo descreve só o que ainda existe.

## 1. PR aberta/atualizada → `pr-merge-actions.yml`

Roda em toda PR contra `master`:

- `merge-gate`: bloqueia o merge enquanto não houver a label `build-passed` (e não pode
  ter `build-failed`). Essas labels são aplicadas pelo workflow que roda `pnpm build` +
  `pnpm test` — nunca autodeclaradas.

## 2. Bump de versão + tag — manual

1. Decidir o impacto (`major`/`minor`/`patch`) e editar `version` em `package.json`.
2. Commitar (`chore(release): bump version to vX.Y.Z`) na `master`.
3. Criar e empurrar a tag anotada: `git tag -a vX.Y.Z -m "vX.Y.Z" && git push origin vX.Y.Z`.

## 3. Tag `v*` empurrada → GitHub Release + aliases (automáticos)

- `release-actions.yml` cria/atualiza a GitHub Release. Usa `.changes/CHANGELOG.md` como
  corpo **se o arquivo existir** (hoje não é mais gerado — o corpo fica vazio/manual).
  Só processa tags `vX.Y.Z` canônicas.
- `tag-aliases-actions.yml` atualiza as tags flutuantes `latest`, `vMAJOR` e `vMAJOR.MINOR`.

## 4. Publicação no npm — manual

`npmjs-release.yml` não dispara sozinho (`workflow_dispatch`):

- GitHub → aba **Actions** → **NPMJS Release** → **Run workflow**, informando `tag`
  (ex. `v2.1.0`) e `npm_dist_tag` (`latest`/`test`).
- Ou via `gh` CLI: `gh workflow run npmjs-release.yml -f tag=v2.1.0 -f npm_dist_tag=latest`.

[← Voltar ao README](../../README.md)
