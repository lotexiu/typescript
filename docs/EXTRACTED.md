# Documentação extraída

_Gerado por `scripts/doc/generate.ts` — extração puramente sintática (`src/language` + `TypescriptLang`), sem type-checker._

89 arquivos, 379 declarações top-level.

---
## src/types.ts

#### `_typeof` — const _(local, L1)_

#### `TTypeOfValue` — type _(exported, L4)_

The literal union of every possible result of the `typeof` operator (`"string"`, `"number"`, etc).

#### `TNotUndefined` — type _(exported, L15)_

`T` with `undefined` excluded from the union.

#### `TAs` — type _(exported, L18)_

`T` narrowed/cast to `T & U` when `T` is assignable to `U`, otherwise `never`.

#### `TUnkown` — type _(exported, L21)_

`T` itself if it has no known keys (e.g. `unknown`, `{}`), otherwise `never`.

#### `TSameType` — type _(exported, L24)_

`A` if `A` and `B` are structurally identical (mutually assignable), otherwise `never`.

## src/aho-corasick/declarations.ts

#### `ASCII_ALPHABET_SIZE` — const _(exported, L6)_

- `@internal`

## src/aho-corasick/model.ts

#### `TrieNode` — class _(local, L4)_

#### `AhoCorasick` — class _(exported, L11)_

## src/aho-corasick/types.ts

#### `TAhoCorasickMatch` — type _(exported, L1)_

#### `TOnPositionHook` — type _(exported, L7)_

#### `TOnMatchHook` — type _(exported, L9)_

#### `TAhoCorasickScanHooks` — type _(exported, L11)_

## src/cache/model.ts

#### `Cache` — class _(exported, L3)_

## src/cache/types.ts

#### `CacheOptions` — type _(exported, L1)_

#### `TCacheGetParam` — type _(exported, L6)_

#### `TCacheReturn` — type _(exported, L8)_

## src/chunk/types.ts

#### `TChunkPosition` — type _(exported, L3)_

## src/chunk/utils.ts

#### `ChunkUtils` — class _(exported, L3)_

## src/computed/model.ts

#### `Computed` — class _(exported, L4)_

#### `computed` — function _(exported, L61)_

## src/field/model.ts

#### `ReadField` — class _(exported, L6)_

#### `Field` — class _(exported, L41)_

#### `readField` — function _(exported, L66)_

#### `field` — function _(exported, L70)_

## src/field/types.ts

#### `TFieldGet` — type _(exported, L1)_

#### `TFieldSet` — type _(exported, L2)_

## src/global/types.ts

#### `TargetImpl` — type _(exported, L5)_

The shape `_Global.register` expects: an optional function-valued override for each method of `T`'s instances (except `valueOf`).

## src/global/utils.ts

#### `GlobalUtils` — class _(exported, L4)_

## src/item/model.ts

#### `Item` — class _(exported, L5)_

## src/language/declarations.ts

#### `SCOPE_KIND_PREFIX` — const _(exported, L6)_

- `@internal`

## src/language/grammar.ts

#### `G` — class _(exported, L13)_

Combinadores para montar a gramática de uma `TLanguageSpec` — todos `static`, sem estado.
Chamadas entre irmãos usam sempre `G.x` (nunca `this`) para sobreviver a destructuring.

Diferença para um motor de gramática comum: dois combinadores conhecem a árvore de escopo
que o `Parser` já montou — `into` desce num escopo aninhado e o parseia com outra regra;
`placeholder` casa o escopo como 1 nó-folha sem descer (ponto de corte para lazy).

## src/language/model.ts

#### `Language` — class _(exported, L18)_

Linguagem compilada de uma única `TLanguageSpec`. `parse` faz 1 passada estrutural (o
`Parser` monta a árvore de escopo) e roda a gramática sobre o stream de tokens — descendo
em escopos aninhados só quando uma regra pede (`G.into`); `G.placeholder` deixa o escopo
como folha, sem processar o conteúdo. `analyze` acrescenta diagnósticos (escopos não
fechados + as `TValidation`s da espec).

Protótipo: `parse` ainda percorre a gramática inteira de forma eager (todo escopo
alcançável acaba materializado). O corte real de lazy é o próximo passo — `descend` /
`G.into` / `G.placeholder` já são o gancho.

## src/language/types.ts

#### `TLanguageSpec` — type _(exported, L10)_

Espec declarativa de uma linguagem — fonte única para o autômato, a tokenização e a
gramática. Não há um "conjunto de regras do lexer" separado: `scope`/`delimited`/`literal`
já são tudo que o scanner precisa, e a gramática referencia esses mesmos `kind`s.

#### `TDelimitedSpec` — type _(exported, L33)_

#### `TCharClassSpec` — type _(exported, L58)_

#### `TLangToken` — type _(exported, L72)_

Token achatado. `kind` é o nome de uma família de `literal`, uma `charClass`, um `delimited`,
ou `scope:<nome>` para o placeholder de um escopo aninhado — nesse caso `scope` aponta o nó
a descer sob demanda (via `G.into`), mantendo o conteúdo do escopo não-processado até ser pedido.

#### `TLangCtx` — type _(exported, L81)_

Estado compartilhado durante um parse — passado a todo matcher.

#### `TLangCapture` — type _(exported, L93)_

#### `TLangMatch` — type _(exported, L100)_

#### `TRule` — type _(exported, L103)_

Função de reconhecimento: consome tokens a partir de `pos`.

#### `TDiagnosticSeverity` — type _(exported, L105)_

#### `TDiagnostic` — type _(exported, L108)_

Um problema encontrado numa fonte — estrutural (parser) ou de uma `TValidation`.

#### `TValidationCtx` — type _(exported, L119)_

Contexto passado a uma `TValidation` — stream achatado (todos os níveis, com trivia) + AST.

#### `TValidation` — type _(exported, L128)_

#### `TAnalysis` — type _(exported, L134)_

Resultado de `Language.analyze` — a árvore + diagnósticos + o stream achatado.

#### `TGateInfo` — type _(exported, L141)_

Gate compilado + o `kind` que os tokens daquele gate carregam.

#### `TLiteralAutomaton` — type _(exported, L149)_

Autômato de literais + o `kind` (nome da família) de cada patternId.

#### `TScanContext` — type _(exported, L152)_

Tudo que `streamOf`/`flatten` precisam da linguagem compilada, num objeto só.

## src/language/utils.ts

#### `LanguageUtils` — class _(exported, L10)_

Helpers estáticos da `Language` — compilação da espec e tokenização de um escopo. Todas as
chamadas entre irmãos via `LanguageUtils.x`, nunca `this`.

## src/language/declarations/programing/typescript/declarations.ts

#### `isIdentStart` — const _(local, L37)_

`TypescriptLang` — espec declarativa de TypeScript pra cima do motor de `src/language`.
Cobre módulos (`import`/`export` em todas as formas comuns), declarações (`class`/
`interface`/`type`/`function`/`const`/`let`/`var`/`enum`/`namespace`, com corpo real —
membros de classe, statements, expressões), tipos (union/intersection/generics/mapped/
condicional/tupla/função) e expressões (precedência completa, arrow functions, template
literals, optional chaining, generics em chamada). A gramática em si (`grammar-*.ts`) está
dividida por camada — cada arquivo só referencia as outras por nome (`G.ref`), nunca importa
o objeto, então não há ciclo de import possível entre eles.

Limitações aceitas (não é um parser de TS 100% completo — ver também os JSDocs de cada
`grammar-*.ts`):
 - Sem regex literal (`/…/`): dado que `/` também é divisão, decidir qual dos dois exige
   contexto do token anterior (lookback), que o `Parser`/`ParserGate` atuais não têm — não
   dá pra declarar como `delimited` sem quebrar toda expressão com divisão. Registrado como
   ideia de evolução do `Parser`, não implementado aqui.
 - Sem `>>`/`>>>`/`>>=`/`>>>=`: colidiria com o fechamento de generics aninhados
   (`Array<Array<T>>`) — o `>>` venceria por maximal munch antes da gramática decidir que
   são dois `>` fechando dois `TypeArgs`. Shift à direita fica sem suporte; `<<` continua ok
   (não conflita com abertura de generics).
 - Sem JSX.
 - ASI não é simulada — `;` é sempre opcional nos pontos onde apareceria, sem checar quebra
   de linha (afeta principalmente `UpdateExpr` postfix `a\n++b`, tratado como `a++; b`).
 - Uma palavra "quase-reservada" (`as`, `type`, `satisfies`, `get`, `set`, `of`, ...) não pode
   ser usada como nome de binding nesta gramática, mesmo sendo legal em JS de verdade — ver
   `literal.keyword` abaixo.

#### `isIdentContinue` — const _(local, L40)_

#### `isDigit` — const _(local, L42)_

#### `KEYWORDS` — const _(local, L44)_

#### `PUNCTUATION` — const _(local, L59)_

Sem `>>`/`>>>`/`>>=`/`>>>=` — ver "Limitações aceitas" no topo do arquivo.

#### `TypescriptLang` — const _(exported, L65)_

## src/language/declarations/programing/typescript/grammar-decl.ts

#### `PropertyKeyComputed` — const _(local, L18)_

Gramática de declarações de topo do `TypescriptLang`: `import`/`export`, `class`/`interface`/
`type`/`function`/`const`/`let`/`var`/`enum`/`namespace`, membros de classe, `declare global`.

Todas as variantes de declaração (`FunctionDecl`, `ClassDecl`, `InterfaceDecl`,
`TypeAliasDecl`, `EnumDecl`, `NamespaceDecl`, `VariableDecl`) são regras **nomeadas
separadas** — cada uma referenciável por `G.ref` (o `Statement` de `grammar-stmt.ts` referencia
cada uma individualmente, pra permitir declaração aninhada dentro de função) — mas todas
produzem o mesmo `AstNode.kind = "Declaration"` (2º argumento de `G.node`, independente do
nome da regra), com um campo `kind` (a keyword) e `name` diferenciando a variante. É assim
que `scripts/doc/extract.ts` consegue continuar tratando qualquer declaração de topo de forma
uniforme (`node.kind === "Declaration"`) sem saber da keyword específica.

#### `PropertyKey` — const _(local, L19)_

#### `HeritageExtends` — const _(local, L21)_

#### `HeritageExtendsList` — const _(local, L22)_

#### `HeritageImplements` — const _(local, L23)_

#### `StaticBlock` — const _(local, L25)_

#### `ClassConstructor` — const _(local, L27)_

#### `ClassMethod` — const _(local, L38)_

#### `ClassProperty` — const _(local, L55)_

#### `ClassMember` — const _(local, L69)_

#### `ClassBody` — const _(local, L71)_

#### `EnumMember` — const _(local, L73)_

#### `DeclHead` — const _(local, L78)_

#### `FunctionDecl` — const _(local, L80)_

#### `ClassDecl` — const _(local, L94)_

#### `ClassExpr` — const _(local, L108)_

`export default class extends Base {}` — classe sem nome, só em posição de expressão/default export.

#### `InterfaceDecl` — const _(local, L121)_

#### `TypeAliasDecl` — const _(local, L133)_

#### `EnumDecl` — const _(local, L146)_

#### `NamespaceDecl` — const _(local, L157)_

#### `VariableDecl` — const _(local, L167)_

#### `Declaration` — const _(local, L178)_

#### `ImportSpecifier` — const _(local, L182)_

#### `NamespaceImport` — const _(local, L188)_

#### `ImportClause` — const _(local, L190)_

#### `ImportDecl` — const _(local, L199)_

#### `ExportClause` — const _(local, L217)_

#### `ExportAllDecl` — const _(local, L234)_

#### `ExportAssignment` — const _(local, L246)_

#### `ExportDefaultDecl` — const _(local, L249)_

`export default <expressão>` — as formas `export default function/class` já entram por `Declaration` (modifiers `export`+`default`).

#### `SideEffect` — const _(local, L255)_

`declare global { … }` / `declare module "x" { … }` — efeito colateral, corpo não desce como declaração.

#### `File` — const _(local, L260)_

#### `DECL_RULES` — const _(exported, L274)_

## src/language/declarations/programing/typescript/grammar-expr.ts

#### `TemplateLiteral` — const _(local, L17)_

Gramática de expressões do `TypescriptLang` — precedência real do JS/TS, de baixo (primário)
pra cima (`Expression`, com o operador vírgula). Binários "achatados" via `G.binary` (1 nó
por nível, não 1 por operador); a cadeia postfix (`.`, `?.`, `[]`, `()`, `!`, generics em
chamada, template tag) via `G.chain`.

Limitações aceitas: sem regex literal (`/…/` fica ambíguo com divisão sem contexto de lexer
com lookback — ver CLAUDE.md), sem JSX, ASI não é simulado (postfix `++`/`--` não distingue
quebra de linha), destructuring assignment (`[a, b] = x`) cai em `ArrayLiteral`/`ObjectLiteral`
comuns em vez de um `AssignmentPattern` dedicado.

#### `SpreadElement` — const _(local, L25)_

#### `ArgList` — const _(local, L27)_

#### `ArrayLiteral` — const _(local, L29)_

#### `PropertyName` — const _(local, L31)_

#### `ComputedPropertyName` — const _(local, L32)_

#### `MethodProperty` — const _(local, L34)_

#### `Property` — const _(local, L48)_

#### `ShorthandProperty` — const _(local, L53)_

#### `PropertyDefinition` — const _(local, L58)_

#### `ObjectLiteral` — const _(local, L60)_

#### `FunctionExpr` — const _(local, L65)_

#### `ParenthesizedExpr` — const _(local, L79)_

#### `PrimaryExpr` — const _(local, L81)_

#### `memberOnlyStep` — const _(local, L100)_

Encadeamento `.foo`/`[expr]` só de acesso — usado pelo alvo de `new` (sem consumir a chamada).

#### `NewExpr` — const _(local, L119)_

#### `postfixStep` — const _(local, L129)_

#### `CallExpr` — const _(local, L199)_

#### `unaryPrefixOp` — const _(local, L201)_

#### `updateOp` — const _(local, L202)_

#### `UnaryExpr` — const _(local, L214)_

Prefixo (`!x`), update prefixo (`++x`) ou postfixo (`x++`) — escrita manual, não
`choice(node(seq(field(arg,CallExpr), op)), CallExpr)`: essa forma computaria `CallExpr` 2x
quando não há `++`/`--` postfixo (a maioria dos casos) — 1x tentando o padrão de update, 1x
de novo no fallback puro. `CallExpr` é a regra mais cara da gramática (desce toda a cadeia
postfix de member/call), e como `UnaryExpr` é chamado uma vez por operando em TODA expressão,
essa duplicação — somada à mesma duplicação em `ExponentExpr` logo abaixo — composta
multiplicativamente a cada nível de aninhamento (mesma classe de bug de `ConditionalExpr`,
mas aqui na regra mais quente do parser: chegou a travar em arquivos de ~250 linhas).

#### `ExponentExpr` — const _(local, L250)_

Mesma razão do JSDoc de `UnaryExpr`: computa `UnaryExpr` 1x, não 2x (associa à direita).

#### `MultiplicativeExpr` — const _(local, L266)_

#### `AdditiveExpr` — const _(local, L267)_

#### `ShiftExpr` — const _(local, L269)_

Sem `>>`/`>>>` — ver "Limitações aceitas" no topo do arquivo (ambiguidade com fechamento de generics).

#### `RelationalExpr` — const _(local, L270)_

#### `AsExpr` — const _(local, L277)_

`x as Foo`, `x satisfies Foo`, `x!` já ficou no postfix — aqui só as duas keywords de tipo.

#### `EqualityExpr` — const _(local, L288)_

#### `BitwiseAndExpr` — const _(local, L289)_

#### `BitwiseXorExpr` — const _(local, L290)_

#### `BitwiseOrExpr` — const _(local, L291)_

#### `LogicalAndExpr` — const _(local, L292)_

#### `LogicalOrExpr` — const _(local, L293)_

#### `ConditionalExpr` — const _(local, L303)_

`test ? true : false` — escrita "manual" (não `G.choice(node(seq(field(test,X),...)), X)`) de
propósito: essa forma computaria `LogicalOrExpr` 2x quando não há `?` (1x tentando o padrão
composto, 1x de novo no fallback) — e como `LogicalOrExpr` desce até `PrimaryExpr`, que volta
a subir até aqui em qualquer parêntese/argumento, essa duplicação compostava
multiplicativamente a cada nível de aninhamento (explosão exponencial real, não hipotética —
travou em arquivos de ~250 linhas). Resolvido computando o operando 1x e ramificando à mão.

#### `YieldExpr` — const _(local, L323)_

#### `ArrowFunction` — const _(local, L328)_

#### `ASSIGN_OPS` — const _(local, L340)_

#### `assignOp` — const _(local, L341)_

#### `AssignmentExpr` — const _(local, L344)_

Mesma razão de `ConditionalExpr` acima: computa `ConditionalExpr` 1x, não 2x.

#### `Expression` — const _(local, L366)_

Entrada da gramática de expressão — inclui o operador vírgula. Não usar dentro de listas
separadas por vírgula (args, elementos de array/objeto): ali a unidade é `AssignmentExpr`.

#### `EXPR_RULES` — const _(exported, L368)_

## src/language/declarations/programing/typescript/grammar-shared.ts

#### `IdentifierName` — const _(local, L16)_

Nome (identificador ou palavra reservada) num sítio onde qualquer um serve — chave de
propriedade (`{ if: 1 }`) ou nome depois de `.` (`foo.default`, `a.class`): em JS de verdade
uma palavra reservada é um nome de propriedade válido, só não um binding.

#### `EntityName` — const _(local, L19)_

`a.b.c` — usado por tipos (`Foo.Bar<T>`) e por `import`/decorators (`@ns.Deco`).

#### `TypeArgs` — const _(local, L32)_

`<Foo, Bar<Baz>>` num sítio de uso (`Map<string, number>`, `foo<T>()`).

#### `TypeParam` — const _(local, L38)_

`<const T extends X = Y>` num sítio de declaração (`class`, `function`, `interface`, `type`).

#### `TypeParams` — const _(local, L48)_

#### `Decorator` — const _(local, L51)_

`@Foo`, `@ns.Foo(a, b)` — em classe, membro ou parâmetro.

#### `MODIFIER_WORDS` — const _(local, L56)_

#### `Modifier` — const _(local, L62)_

Um modificador solto (`export`, `static`, `readonly`, ...) — a ordem real na fonte não é validada.

#### `Modifiers` — const _(local, L64)_

#### `BindingName` — const _(local, L70)_

Alvo de binding — identificador simples ou pattern de destructuring. Usado por parâmetros,
declaradores de `const`/`let`/`var` e o alvo de uma atribuição desestruturada.

#### `BindingProperty` — const _(local, L72)_

#### `ObjectPattern` — const _(local, L82)_

#### `ArrayPatternElement` — const _(local, L84)_

#### `ArrayPattern` — const _(local, L93)_

#### `TypeAnnotation` — const _(local, L96)_

Anotação de tipo opcional (`: Foo`) — parâmetro, declarador, retorno de função.

#### `Param` — const _(local, L103)_

Parâmetro de função/método/arrow — inclui os modificadores de "constructor property
shorthand" (`constructor(private x: string)`), que em TS puro só fazem sentido num
construtor, mas aceitar em qualquer parâmetro é uma simplificação deliberada.

#### `SHARED_RULES` — const _(exported, L116)_

## src/language/declarations/programing/typescript/grammar-stmt.ts

#### `VariableDeclarator` — const _(local, L13)_

Gramática de statements do `TypescriptLang`. `StatementList` é resiliente (`G.skip()` no
fallback) — igual `File`, um trecho não reconhecido não trava o resto do bloco. A única
exceção deliberada é o corpo de um `case`/`default` (`SwitchStatement`): ali `many(Statement)`
roda **sem** skip-fallback, porque `Statement` já falha limpo em `case`/`default`/`}` (essas
palavras são `keyword`, não `identifier` — ver `declarations.ts`) e é exatamente essa falha
que delimita onde um `case` termina.

#### `VariableDeclClause` — const _(local, L19)_

`const a = 1, b: string = "x"` sem o `;` final — reusado pelo cabeçalho clássico do `for`.

#### `VariableStatement` — const _(local, L27)_

#### `Block` — const _(local, L29)_

#### `IfStatement` — const _(local, L31)_

#### `ForOfStatement` — const _(local, L41)_

#### `ForInStatement` — const _(local, L59)_

#### `ForStatementClassic` — const _(local, L76)_

#### `ForStatement` — const _(local, L94)_

#### `WhileStatement` — const _(local, L96)_

#### `DoWhileStatement` — const _(local, L101)_

#### `CaseClause` — const _(local, L113)_

Corpo de um `case`/`default` — sem skip-fallback, ver JSDoc do arquivo.

#### `DefaultClause` — const _(local, L118)_

#### `SwitchStatement` — const _(local, L123)_

#### `CatchClause` — const _(local, L132)_

#### `TryStatement` — const _(local, L137)_

#### `ReturnStatement` — const _(local, L147)_

#### `ThrowStatement` — const _(local, L148)_

#### `BreakStatement` — const _(local, L149)_

#### `ContinueStatement` — const _(local, L150)_

#### `EmptyStatement` — const _(local, L151)_

#### `LabeledStatement` — const _(local, L153)_

#### `ExpressionStatement` — const _(local, L158)_

#### `Statement` — const _(local, L160)_

#### `StatementList` — const _(local, L183)_

#### `STMT_RULES` — const _(exported, L185)_

## src/language/declarations/programing/typescript/grammar-type.ts

#### `PrimitiveType` — const _(local, L15)_

Gramática de tipos do `TypescriptLang`. Segue a precedência real do TS de baixo pra cima:
`PrimaryType` (referência, literal, objeto, tupla, parêntese) → sufixos postfix (`[]`,
indexed access) → operadores prefixos (`keyof`/`typeof`/`readonly`/`infer`) → `&` → `|` →
função/construtor (`(...) => T`) → condicional (`T extends U ? A : B`) → `Type` (entrada).

Limitações aceitas: sem mapped types com todos os modificadores (`+`/`-` em `readonly`/`?`),
sem template literal types com substituição estruturada (o token `template` é tratado como
folha opaca), `satisfies`/`as const` ficam na camada de expressão, não na de tipo.

#### `NegativeLiteralType` — const _(local, L21)_

#### `LiteralType` — const _(local, L23)_

#### `TypeQuery` — const _(local, L26)_

`typeof foo.bar` — só o lado de valor, sem `typeof import(...)`.

#### `TypeRef` — const _(local, L28)_

#### `FunctionTypeParam` — const _(local, L31)_

`(a: string, b?: number) => T` — parâmetros na forma de tipo (nome opcional, sem default).

#### `FunctionType` — const _(local, L41)_

#### `ConstructorType` — const _(local, L51)_

#### `TupleElement` — const _(local, L63)_

#### `TupleType` — const _(local, L72)_

#### `ParenthesizedType` — const _(local, L74)_

#### `IndexSignature` — const _(local, L77)_

Membro de object type / interface: assinatura de propriedade, método, index signature ou mapped type.

#### `MappedTypeMember` — const _(local, L90)_

`[K in Keys]: T` — mapped type.

#### `PropertySignature` — const _(local, L108)_

#### `TypeMember` — const _(local, L126)_

#### `ObjectTypeMembers` — const _(local, L129)_

Lista de membros "crua" — reusada por `InterfaceDecl` (que envolve o próprio nó `Declaration`, não `ObjectType`).

#### `ObjectType` — const _(local, L131)_

#### `PrimaryType` — const _(local, L133)_

#### `ArrayOrIndexedType` — const _(local, L146)_

Sufixos postfix: `T[]` (array) e `T[K]` (indexed access) — a mesma sintaxe `[...]`.

#### `TypeOperator` — const _(local, L156)_

`keyof`/`readonly`/`infer`/`unique` — prefixo, associa à direita.

#### `IntersectionType` — const _(local, L161)_

#### `UnionType` — const _(local, L162)_

#### `ConditionalType` — const _(local, L172)_

`check extends extendsType ? true : false` — escrita manual, não `choice(node(seq(field(check,
UnionType),...)), UnionType)`: essa forma recomputaria `UnionType` 2x quando não há `extends`
(1x tentando o padrão composto, 1x de novo no fallback), e como `Type` é referenciado em
praticamente todo lugar (qualquer anotação de tipo, generic, tipo de retorno), a duplicação
composta multiplicativamente a cada nível de aninhamento — explosão exponencial real (ver a
mesma nota em `ConditionalExpr`, `grammar-expr.ts`).

#### `Type` — const _(local, L197)_

#### `TYPE_RULES` — const _(exported, L199)_

## src/language/declarations/programing/typescript/validations.ts

#### `preferHashPrivate` — const _(exported, L13)_

`private`/`protected`/`public` do TypeScript num membro de classe → sugere `#` (privado
real de runtime, não apagado na compilação). Aviso, não erro. Cobre também
`constructor(private x: ...)`.

#### `TS_VALIDATIONS` — const _(exported, L28)_

## src/language/node/model.ts

#### `AstNode` — class _(exported, L8)_

Nó genérico de uma árvore sintática. `kind` é uma string livre definida pela gramática
que o produziu — o motor não conhece nenhum vocabulário fixo. Guarda apenas offsets no
source da raiz (flyweight); `text` fatia sob demanda, igual `ParserNode.content`.

#### `AstRoot` — class _(exported, L61)_

Raiz de uma árvore sintática — dona do `source` (fonte única da verdade para os
flyweights) e dos índices de navegação.

## src/language/node/types.ts

#### `TAstVisitor` — type _(exported, L4)_

Callback de `AstNode.walk` / `AstRoot.walk` — retornar `false` poda a subárvore atual.

## src/locale/declarations.ts

#### `LOCALES` — const _(exported, L2)_

## src/locale/error.ts

#### `LocaleError` — class _(exported, L4)_

## src/locale/types.ts

#### `TLocales` — type _(exported, L3)_

#### `TLocale` — type _(exported, L5)_

#### `TLocaleObject` — type _(exported, L7)_

#### `TLocaleMap` — type _(exported, L9)_

## src/locale/utils.ts

#### `LocaleUtils` — class _(exported, L4)_

## src/mask/model.ts

#### `DIGITS` — const _(local, L9)_

#### `LETTERS` — const _(local, L9)_

#### `SYMBOLS` — const _(local, L9)_

#### `Mask` — class _(exported, L11)_

## src/mask/types.ts

#### `TMaskRule` — type _(exported, L3)_

## src/mask/compiled-pattern/model.ts

#### `MaskCompiledPattern` — class _(exported, L5)_

## src/mask/token/model.ts

#### `TMaskStaticToken` — class _(exported, L3)_

#### `TMaskRuleToken` — class _(exported, L7)_

#### `TMaskToken` — type _(exported, L20)_

## src/matrix/model.ts

#### `Matrix` — class _(exported, L6)_

## src/matrix/types.ts

#### `TMatrixBuffer` — type _(exported, L1)_

#### `TMatrixBufferCtor` — type _(exported, L12)_

## src/model/model.ts

#### `Model` — class _(exported, L8)_

Menor primitivo reativo da lib: guarda um valor e notifica assinantes quando ele muda.
Não sabe de UI/DOM e não é um plugin — é a peça que plugins "adaptadores de util"
(ex.: MaskPlugin) usam por baixo para virar reativos sem reimplementar notify-on-change.

#### `model` — function _(exported, L43)_

## src/natives/types.ts

#### `TAwaited` — type _(exported, L7)_

Recursively unwraps the "awaited" type of a type. Non-promise thenables should resolve to `never`. This emulates the behavior of `await`.

- `@example`

#### `TNoInfer` — type _(exported, L15)_

Marker for type position without inference.

- `@example`

#### `TNonNullable` — type _(exported, L23)_

Removes null and undefined from T.

- `@example`

#### `TExclude` — type _(exported, L31)_

Excludes from T the types that are assignable to U.

- `@example`

#### `TExtract` — type _(exported, L39)_

Extracts from T the types that are assignable to U.

- `@example`

## src/natives/array/types.ts

#### `TArray` — type _(exported, L5)_

Thin alias over the built-in `Array<T>`.

#### `TArrayLike` — type _(exported, L8)_

Thin alias over the built-in `ArrayLike<T>`.

#### `TExtractValues` — type _(exported, L11)_

The union of every element type in a tuple/array `T`.

#### `TArrayType` — type _(exported, L14)_

Extracts an array type's element type — `never` if `T` isn't an array.

#### `TValueOf` — type _(exported, L17)_

The element type at `Index` in tuple `List` — `-1` means the last element.

#### `TArrayRest` — type _(exported, L26)_

The remaining tuple elements of `A` after removing the leading elements shared with `B`.

#### `TArrayOf` — type _(exported, L31)_

#### `TPair` — type _(exported, L38)_

A 2-tuple `[T, T2]`.

#### `TAsArray` — type _(exported, L41)_

`T` itself if it's already an array type, otherwise `never`.

#### `TReverseArray` — type _(exported, L44)_

Reverses the element order of a tuple type.

#### `TMap` — type _(exported, L47)_

Maps a tuple type `List` to a new tuple type where each element is the value of `Path` in the corresponding element of `List`.

## src/natives/array/utils.ts

#### `ArrayUtils` — class _(exported, L1)_

## src/natives/async/utils.ts

#### `AsyncUtils` — class _(exported, L1)_

## src/natives/class/declarations.ts

#### `Timeout` — type _(exported, L4)_

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

#### `Timeout` — const _(exported, L6)_

The real `NodeJS.Timeout` type/value pair — Node doesn't expose this constructor directly, so it's recovered from a throwaway `setTimeout` call.

## src/natives/class/types.ts

#### `TPrototype` — type _(exported, L4)_

The shape of an object exposing a `constructor: TConstructor<T>`.

#### `TClazz` — type _(exported, L9)_

A constructable, class-like type — `TConstructor<T>` intersected with `Function`/`NewableFunction`.

#### `TExtendClass` — type _(exported, L14)_

`TClazz<T>`, optionally merged with `E`'s shape — for typing subclassing/mixin-style extension.

#### `TTimeout` — type _(exported, L19)_

The constructor type of Node's `NodeJS.Timeout`.

## src/natives/class/utils.ts

#### `ClassUtils` — class _(exported, L4)_

## src/natives/date/declarations.ts

#### `MS_CONVERTIONS` — const _(exported, L3)_

## src/natives/date/types.ts

#### `TMSConvertion` — type _(exported, L3)_

#### `TMSConvertions` — type _(exported, L4)_

#### `TTimeUnit` — type _(exported, L5)_

#### `TDateKeys` — type _(local, L7)_

#### `TDateSetValue` — type _(exported, L9)_

#### `TDateSetChecker` — type _(exported, L11)_

## src/natives/date/utils.ts

#### `DateUtils` — class _(exported, L4)_

## src/natives/function/types.ts

#### `TFnType` — type _(local, L3)_

#### `TFn` — type _(exported, L5)_

#### `TFnDeclaration` — type _(exported, L9)_

Rewrites a function type with a leading "this-like" parameter into a method declaration with an explicit `this: V` parameter (used to type `thisAsParameter`-wrapped functions).

#### `TBindFnOption` — type _(local, L15)_

#### `TBindFn` — type _(exported, L22)_

Callable shape returned by `_Function.rebind` — carries the original `fn`, the bound `context`, and the accumulated `args` alongside the callable signature.

#### `TModifyFnParameters` — type _(exported, L30)_

`Fn`'s type with its parameter list replaced by `Args`, keeping its original return type.

#### `TModifyFnReturn` — type _(exported, L34)_

`Fn`'s type with its return type replaced by `ReturnType`, keeping its original parameters.

#### `TParameters` — type _(exported, L38)_

Extracts a function type's parameter tuple (tolerates non-function `T`, resolving to `never` instead of requiring `(...args: any) => any`).

#### `TReturnType` — type _(exported, L41)_

Extracts a function type's return type — thin alias ov'er the built-in `ReturnType`.

#### `TAbstractConstructor` — type _(exported, L50)_

#### `TConstructor` — type _(exported, L52)_

#### `TConstructorInfo` — type _(exported, L55)_

Splits a constructor type into its `{ instance, parameters }` shape.

#### `TConstructorParameters` — type _(exported, L59)_

Extracts a constructor type's parameter tuple.

#### `TInstanceType` — type _(exported, L62)_

Extracts a constructor type's instance type — thin alias over the built-in `InstanceType`.

#### `TDebounceFn` — type _(exported, L65)_

The wrapped function `debounce()` returns — callable like `T`, plus `clear()` to cancel a pending call.

#### `TThrottleFn` — type _(exported, L70)_

The wrapped function `throttle()` returns — callable like `T`, plus `clear()` to reset its interval tracking.

#### `TStepFn` — type _(exported, L75)_

The wrapped function `step()` returns — callable like `T`, plus `clear()` to reset its call counter.

#### `TOnceFn` — type _(exported, L80)_

The wrapped function `once()` returns — callable like `T`, plus `clear()` to allow it to run again.

#### `TScheduleOnceFn` — type _(exported, L85)_

The wrapped function `scheduleOnce()` returns — `clear()` cancels a pending call, `flush()` runs it immediately (if pending) instead of waiting for the microtask.

#### `TMemoizeFn` — type _(exported, L91)_

## src/natives/function/utils.ts

#### `FunctionUtils` — class _(exported, L14)_

## src/natives/math/locale.ts

#### `MATH_LOCALES` — const _(exported, L3)_

## src/natives/math/types.ts

#### `IDigitSum` — type _(local, L3)_

## src/natives/math/utils.ts

#### `MathUtils` — class _(exported, L4)_

## src/natives/number/locale.ts

#### `NUMBER_LOCALES` — const _(exported, L3)_

## src/natives/number/types.ts

#### `TDigit` — type _(exported, L2)_

A single decimal digit literal type, `0`-`9`.

#### `TNumberTypes` — type _(local, L4)_

#### `TNegate` — type _(exported, L19)_

The arithmetic negation of a numeric literal type.

#### `TDigitCompare` — type _(exported, L27)_

Compares two single-digit literal types: `-1` (`A < B`), `0` (equal), or `1` (`A > B`), via a static lookup table.

## src/natives/number/utils.ts

#### `NumberUtils` — class _(exported, L4)_

## src/natives/object/types.native.ts

#### `TRequired` — type _(exported, L9)_

Makes all properties of T required.

- `@example`

#### `TReadonly` — type _(exported, L17)_

Makes all properties of T readonly.

- `@example`

#### `TPick` — type _(exported, L25)_

From T, picks a set of properties whose keys are in the union K.

- `@example`

#### `TOmit` — type _(exported, L35)_

Constructs a type with the properties of T except for those in type K.

- `@example`

#### `TPartial` — type _(exported, L43)_

Makes all properties of T optional.

- `@example`

## src/natives/object/types.ts

#### `TNonObject` — type _(exported, L4)_

Basic Non-object types (primitives, functions, and arrays). Used for filtering out non-object values.

#### `TObject` — type _(exported, L8)_

`T` narrowed to plain-object shapes only — `never` for functions, arrays, or non-objects.

#### `TIterKeyType` — type _(exported, L10)_

#### `TIterate` — type _(exported, L13)_

Keys of `T` that are iterable (string or number).

#### `TKeyOf` — type _(exported, L15)_

#### `TRecord` — type _(exported, L18)_

Builds an object type from a union of `[key, value]` tuples — the inverse of `TEntriesReturn`.

#### `TCommonFields` — type _(exported, L23)_

The subset of `T`'s fields whose keys also exist on `U`.

#### `TKeysType` — type _(exported, L25)_

#### `TMethodKey` — type _(exported, L29)_

#### `TDeepPartial` — type _(exported, L32)_

`T` with every nested property (recursively) made optional.

#### `TPath` — type _(exported, L41)_

Every valid dot-separated path string into `T`, including nested object paths — used to type `valueFromPath`/`setValueFromPath`.

#### `TPathValue` — type _(exported, L45)_

Resolves the type found at a dot-separated `Path` string into `T` (the return type of `valueFromPath`).

#### `TEntriesReturn` — type _(exported, L56)_

The array of `[key, value]` tuples `Object.entries(value)` would produce for `T` — the return type of `ObjectUtils.entries`.

#### `TDiffType` — type _(exported, L60)_

#### `TDiffObject` — interface _(local, L61)_

#### `TDiffValue` — type _(exported, L64)_

#### `TDiff` — type _(exported, L66)_

## src/natives/object/utils.ts

#### `ObjectUtils` — class _(exported, L7)_

- `@internal`

#### `isNull` — const _(exported, L94)_

#### `isNullOrUndefined` — const _(exported, L94)_

#### `json` — const _(exported, L94)_

#### `isObject` — const _(exported, L94)_

## src/natives/proxy/types.ts

#### `TProxyProp` — type _(exported, L1)_

#### `TProxyHandler` — interface _(exported, L3)_

## src/natives/proxy/utils.ts

#### `ProxyUtils` — class _(exported, L3)_

#### `proxy` — const _(exported, L9)_

## src/natives/regex/declarations.ts

#### `DATE` — const _(local, L1)_

#### `REGEX_PATTERNS` — const _(exported, L8)_

## src/natives/regex/utils.ts

#### `RegexUtils` — class _(exported, L3)_

## src/natives/string/types.ts

#### `TStrForEeachCallback` — type _(exported, L2)_

`size` is the grapheme's UTF-16 code unit width — 1 for BMP characters, 2+ for surrogate pairs/ZWJ sequences.

#### `TStrOnCharCallback` — type _(exported, L5)_

`size` is the matched character's UTF-16 code unit width — 1 for BMP, 2 for an astral code point.

#### `TReverseStr` — type _(exported, L8)_

Reverses a string literal type character by character.

#### `TStrToUnion` — type _(exported, L13)_

#### `TStrToArray` — type _(exported, L20)_

## src/natives/string/utils.ts

#### `LETTERS` — const _(local, L5)_

#### `DIGITS` — const _(local, L5)_

#### `WHITESPACE` — const _(local, L5)_

#### `SYMBOLS` — const _(local, L5)_

#### `StringUtils` — class _(exported, L7)_

#### `TUString` — type _(exported, L378)_

## src/parser/model.ts

#### `Parser` — class _(exported, L7)_

## src/parser/types.ts

#### `TGatePatternInfo` — type _(exported, L3)_

## src/parser/node/model.ts

#### `ParserGate` — class _(exported, L3)_

#### `ParserGap` — class _(exported, L24)_

#### `ParserNode` — class _(exported, L40)_

#### `ParserRoot` — class _(exported, L76)_

## src/readonly-value/model.ts

#### `ReadonlyValue` — class _(exported, L1)_

#### `readonlyValue` — function _(exported, L18)_

## src/state/keyboard/model.ts

#### `KeyboardState` — class _(exported, L4)_

## src/state/mouse/model.ts

#### `MouseState` — class _(exported, L4)_

## src/stopwatch/model.ts

#### `StopWatch` — class _(exported, L6)_

## src/subscription/locale.ts

#### `STOP_WATCH_LOCALES` — const _(exported, L3)_

## src/subscription/model.ts

#### `Subscription` — class _(exported, L3)_

#### `SubscriptionController` — class _(exported, L20)_

## src/subscription/types.ts

#### `TValueListener` — type _(exported, L2)_

Listener signature `ValueCell.subscribe(...)` accepts.

#### `TValueUnsubscribe` — type _(exported, L5)_

The unsubscribe function `ValueCell.subscribe(...)` returns.

#### `TSubscription` — type _(exported, L7)_

## src/theme/model.ts

#### `Theme` — class _(exported, L5)_

## src/theme/types.ts

#### `TThemeMode` — type _(exported, L2)_

## src/theme/palette/declarations.ts

#### `TONE_STOPS` — const _(exported, L3)_

#### `BASIC` — const _(local, L6)_

#### `LIGHT` — const _(local, L30)_

#### `PASTEL` — const _(local, L44)_

#### `NEON` — const _(local, L58)_

#### `DARK` — const _(local, L72)_

#### `EARTH` — const _(local, L86)_

#### `PALETTES` — const _(exported, L99)_

## src/theme/palette/model.ts

#### `Palette` — class _(exported, L8)_

#### `CustomPalette` — class _(exported, L49)_

#### `TonalPalette` — class _(exported, L63)_

## src/theme/palette/types.ts

#### `TToneStops` — type _(exported, L3)_

#### `TToneStop` — type _(exported, L4)_

## src/theme/style/model.ts

#### `ThemeStyle` — class _(exported, L3)_

## src/theme/style/types.ts

#### `SlotColor` — type _(exported, L5)_

## src/time/model.ts

#### `Time` — class _(exported, L6)_

## src/time/types.ts

#### `TCalendarDay` — type _(exported, L1)_

## src/value-history/model.ts

#### `ValueHistory` — class _(exported, L5)_

## src/value-history/types.ts

#### `TIndexedValue` — type _(exported, L2)_

A value paired with its position in `ValueHistory`'s stack.

#### `TValueHistoryType` — type _(exported, L8)_

The kind of history-changing action being reported (currently just `'register'`, or `false` for none).

#### `TValueHistoryState` — interface _(exported, L11)_

A snapshot of `ValueHistory`'s undo/redo neighborhood around the current position.

#### `TNewValueHistoryState` — interface _(exported, L18)_

`TValueHistoryState` plus the value that was just registered — passed to change listeners.

#### `TValueHistoryCallBack` — type _(exported, L23)_

Listener signature for `ValueHistory` state changes.

#### `TValueHistoryClearCallback` — type _(exported, L26)_

Listener signature for `ValueHistory` being cleared — receives the full history that was discarded.

## src/variant/model.ts

#### `Variant` — class _(exported, L6)_

#### `variant` — function _(exported, L37)_

## src/variant/types.ts

#### `TVariantDerive` — type _(exported, L2)_

Resolves the value for a given variant name — the function a `VariantCell` is constructed with.

#### `TVariant` — type _(exported, L3)_
