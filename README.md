# @lotexiu/typescript

Primitivos universais em TypeScript, **sem framework**: estado reativo, controles de interface headless com acessibilidade, máscaras, tempo, decimais exatos, temas com contraste garantido, um motor de gramática, animação e geometria. Uma única dependência de runtime ([`colorjs.io`](https://colorjs.io)).

```bash
pnpm add @lotexiu/typescript
```

## Estado reativo

```ts
import { signal, computed } from '@lotexiu/typescript'

const count = signal(1)
const double = computed(() => count() * 2)
double.subscribe((value) => console.log(value))
count.set(2) // 4
```

`signal`/`computed` são funções: chame para ler. Dependências são rastreadas sozinhas; objetos mutados no lugar avisam com `notify()`.

## Controles headless

Estado, teclado, foco e ARIA de controles de interface, sem DOM nem CSS — você escolhe o visual e o framework.

```ts
import { Slider, Select, Form } from '@lotexiu/typescript'

const volume = new Slider({ min: 0, max: 100, value: 30 })
volume.keydown({ key: 'ArrowRight' }) // true — volume.value() agora é 31; o KeyboardEvent do DOM/React serve direto
volume.parts.thumb()                  // { role: 'slider', 'aria-valuenow': 31, tabindex: 0, ... }

// uma tela inteira a partir de dados
const settings = new Form({
  definitions: {
    volume: { kind: 'range', label: 'Volume', default: 30, min: 0, max: 100 },
    theme: { kind: 'choice', label: 'Tema', default: 'dark', options: ['dark', 'light'], control: 'radio' },
  },
})
settings.fields // [{ id, definition, control }] — renderize cada controle pelo tipo
```

Disponíveis: `Checkbox`, `Switch`, `Slider`, `TextField` (com máscara), `Select`, `Combobox`, `Listbox`, `RadioGroup`, `Tabs`, `Menu`, `Dialog`, `Popover`, `Disclosure`, `Pagination`, `Form`, além de `PositionUtils` (posicionamento de flutuantes) e `LayerStack` (qual overlay está no topo).

Adaptadores: [`@lotexiu/react`](https://www.npmjs.com/package/@lotexiu/react), [`@lotexiu/angular`](https://www.npmjs.com/package/@lotexiu/angular) e, para qualquer outro caso, [`@lotexiu/dom`](https://www.npmjs.com/package/@lotexiu/dom).

## Outros módulos

| Área | O que tem |
|---|---|
| Máscara | `Mask.apply/unapply/valid`, `Mask.of(...)` com os três valores (mascarado, sem máscara, tipado), números, datas, checagens e cursor |
| Tempo | `PlainDate`, `PlainTime`, `Duration` (vocabulário do Temporal, imutáveis), `CalendarUtils` |
| Números | `Decimal` (exato, arredondamento explícito, `allocate` sem perder centavos), `MathUtils`, `NumberUtils` |
| Tema | `Theme`, `ThemeStyle`, `PaletteFactory`, papéis com contraste mínimo (WCAG/APCA), ajustes do usuário |
| Animação e gráficos | `Spring`, `Tween`, `EasingUtils`, `PathBuilder` (SVG/canvas), `ValueNoise` |
| Texto e código | `StringUtils` (Unicode correto), `Parser`, `Language` + `TypescriptLang`, `AhoCorasick` |
| Utilitários | `Random` (com semente), `IdUtils`, `ResultUtils`, `Cache`, `PriorityQueue`, `Semaphore`, `Mutex`, `ValueHistory`, `StopWatch` |

## Documentação

A referência completa — cada símbolo público com assinatura, descrição e exemplos — é gerada do código em [`docs/api`](https://github.com/lotexiu/typescript/blob/master/docs/api/README.md).

## Licença

MIT
