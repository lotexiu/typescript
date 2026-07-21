# @lotexiu/typescript

Biblioteca TypeScript utilitária e sem dependência de framework — pensada pra funcionar tanto dentro do monorepo `@lotexiu` quanto solta em qualquer outro projeto Node/browser.

Alguns dos pilares:

- Helpers de null-safety, filtros funcionais (`debounce`/`throttle`/`step`/`once`) e utilitários de tipo pra Array/Object/String/Function/Number/Math/Date.
- Extensões nativas (`String.prototype`, `Function.prototype`) registradas via um mecanismo central (`GlobalUtils`).
- Motor de máscara de input (`MaskUtils`), com tokens customizáveis, cache de compilação e um helper de posição de caret.
- Gerenciadores de input de browser (teclado, mouse, hotkey) e tema (light/dark), todos com o mesmo ciclo de vida "só escuta enquanto tem assinante" (`CaptureManager`).
- Sistema de plugins de componente (`TPlugin<T>`/`ValueCell`) agnóstico de framework — máscara, números, datas, validação e checagem assíncrona.
- Geração de paleta de cores (`buildTonalPalette`, via `colorjs.io`) e troca de tema/estilo em runtime (`VariantCell`).

A única dependência real de runtime é [`colorjs.io`](https://colorjs.io) — o resto é zero-dependency por design.

---

## Guia rápido

- [Instalação](docs/guide/installation.md)
- [Aliases de importação](docs/guide/aliases.md)
- [Scripts disponíveis](docs/guide/scripts.md)
- [Testes](docs/guide/testing.md)
- [Versionamento, tags e release](docs/guide/release.md)
- [Contribuindo](CONTRIBUTING.md)

## Documentação

- [`docs/API.md`](docs/API.md) — referência da API pública: o que fica disponível depois de `pnpm add @lotexiu/typescript`.
- [`docs/PROJECT.md`](docs/PROJECT.md) — referência completa do projeto (inclui código interno), com link direto pra cada declaração no código-fonte.
- [`.changes/CHANGELOG.md`](.changes/CHANGELOG.md) — histórico de releases.
- [`CLAUDE.md`](CLAUDE.md) — arquitetura e decisões de design em profundidade, pra quem for mexer no código (incluindo assistentes de IA).

`docs/API.md`, `docs/PROJECT.md` e `docs/modules/*` são gerados a partir do JSDoc do código-fonte (`pnpm run docs`) — não edite esses arquivos à mão.

## Licença

MIT — veja o campo `license` em [`package.json`](package.json).
