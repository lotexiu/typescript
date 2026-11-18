# `parser`

_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._

[← Índice da API](README.md)

| Símbolo | Tipo | Resumo |
|---|---|---|
| [`Parser`](#parser) | classe | Parser de escopos: reconhece só delimitadores (`ParserGate`) e monta a árvore de escopos de um texto, sem entender a linguagem. O texto é um signal e a árvore (`root`) é recalculada sob demanda quando ele ou os gates mudam. |

---

## `Parser`

classe · [src/parser/model.ts:16](../../src/parser/model.ts#L16)

Parser de escopos: reconhece só delimitadores (`ParserGate`) e monta a árvore de escopos de um texto, sem entender a linguagem.
O texto é um signal e a árvore (`root`) é recalculada sob demanda quando ele ou os gates mudam.

```ts
class Parser
```

**Exemplo**

```ts
const parser = new Parser()
parser.addGates(new ParserGate('(', ')'), new ParserGate('"', '"', true))
parser.text.set('f(a, "b)")')
parser.root.children[0].content // 'a, "b)"'
```

### Construtor

#### `constructor()`

### Propriedades

#### `public readonly text = signal('')`

Texto a parsear.

#### `get root(): ParserRoot`

Árvore de escopos do texto atual (reativa).

#### `get escape()`

Caractere de escape: um delimitador precedido por ele um número ímpar de vezes não conta.

#### `set escape(value: string)`

Troca o caractere de escape; a árvore é recalculada na próxima leitura.

#### `get trackGaps()`

Guarda também os trechos entre os escopos (`gaps`) de cada nó.

#### `set trackGaps(value: boolean)`

Liga ou desliga a coleta de `gaps`.

### Métodos

#### `clearGates()`

Remove todos os gates.

#### `addGates(...gates: ParserGate[])`

Adiciona gates; a árvore é recalculada na próxima leitura.
