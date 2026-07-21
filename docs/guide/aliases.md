# Aliases de importação

Só valem **dentro do monorepo**, via `tsconfig.json`. Quem consome `@lotexiu/typescript` publicado usa os exports normais do pacote (`import { MaskUtils } from '@lotexiu/typescript'`), não estes aliases.

| Alias | Diretório |
|-------|-----------|
| `@ts/*` | `src/*` |
| `@tsn/*` | `src/natives/*` |
| `@tsn-array/*` | `src/natives/array/*` |
| `@tsn-class/*` | `src/natives/class/*` |
| `@tsn-date/*` | `src/natives/date/*` |
| `@tsn-function/*` | `src/natives/function/*` |
| `@tsn-math/*` | `src/natives/math/*` |
| `@tsn-number/*` | `src/natives/number/*` |
| `@tsn-object/*` | `src/natives/object/*` |
| `@tsn-string/*` | `src/natives/string/*` |
| `@tsn-validation/*` | `src/natives/validation/*` |

Prefira o alias do domínio do módulo (ex.: `@tsn-string/implementations` dentro de `mask/`) ao cruzar a fronteira de um `src/natives/<x>/` — dentro do próprio diretório do módulo, import relativo (`./types`) é o normal.

[← Voltar ao README](../../README.md)
