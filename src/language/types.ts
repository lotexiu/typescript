import type { ParserGate, ParserNode } from '@ts/parser/node/model';
import { AstNode, AstRoot } from './node/model';
import { AhoCorasick } from '@ts/aho-corasick/model';

/**
 * Espec declarativa de uma linguagem — fonte única para o autômato, a tokenização e a
 * gramática. Não há um "conjunto de regras do lexer" separado: `scope`/`delimited`/`literal`
 * já são tudo que o scanner precisa, e a gramática referencia esses mesmos `kind`s.
 */
type TLanguageSpec = {
	/** Delimitadores pareados que formam a árvore de escopo (transparentes — conteúdo é tokenizado). */
	scope: Record<string, readonly [open: string, close: string]>;
	/** Regiões opacas: nada dentro é tokenizado, o bloco inteiro vira 1 token do `kind` da família. */
	delimited: Record<string, TDelimitedSpec | readonly TDelimitedSpec[]>;
	/** Classes de caractere por predicado (identificador, número, espaço, ...). */
	charClass: Record<string, TCharClassSpec>;
	/** Famílias de literais (keywords, operadores, pontuação). Alimentam o autômato; o `kind` do token é o nome da família. */
	literal: Record<string, readonly string[]>;
	/** Regras nomeadas da gramática, montadas com os combinadores de `G`. */
	grammar: Record<string, TRule>;
	/** Nome da regra de entrada. */
	start: string;
	/** Caractere de escape (ex: `"\\"`) — um `open`/`close`/`${` precedido por ele em número ímpar não conta. */
	escape?: string;
	/**
	 * Validações extras (camada estilo ESLint) — rodam sobre o stream achatado + a AST e
	 * emitem `TDiagnostic`s. Separadas da gramática de propósito: a gramática são as regras
	 * absolutas da linguagem, isto é opt-in (regras de projeto/framework).
	 */
	validate?: readonly TValidation[];
};

/**
 * Uma região opaca (string, comentário, template): o conteúdo não é tokenizado, vira 1 token do `kind` da família.
 */
type TDelimitedSpec = {
	/** Texto que abre a região. */
	open: string;
	/** Texto que fecha a região. */
	close: string;
	/** false = o `close` não entra no token (ex: comentário de linha terminado por `\n`). Default: true. */
	consumeClose?: boolean;
	/** Marca o `kind` como trivia — filtrado antes da gramática. */
	trivia?: boolean;
	/**
	 * Roda 1x por match (offsets, não o `value` fatiado). Retornar um `kind` troca o `kind`
	 * do token só nesse match (ex: `/**` dentro de `blockComment` virar `jsdoc`); o teste de
	 * trivia é refeito sobre o `kind` final.
	 */
	subtype?: (source: string, start: number, end: number) => string | undefined;
	/**
	 * Semi-transparente: opaco **exceto** por janelas `[open, close]` que voltam a ser código
	 * (o `${ … }` de uma template string). Em vez de 1 token só, o stream recebe pedaços de
	 * texto (`kind` da família) alternados com placeholders de escopo `scope:<nome>Interp`,
	 * nos quais a gramática pode descer (`G.into`).
	 */
	interpolate?: readonly [open: string, close: string];
};

/**
 * Uma classe de caracteres reconhecida por predicado sobre o código UTF-16 (identificador, número, espaço...).
 */
type TCharClassSpec = {
	/** Testado no 1º char do run. */
	start: (code: number) => boolean;
	/** Testado do 2º char em diante. Default: mesmo predicado de `start`. */
	continue?: (code: number) => boolean;
	/** Marca o `kind` como trivia — filtrado antes da gramática. */
	trivia?: boolean;
};

/**
 * Token achatado. `kind` é o nome de uma família de `literal`, uma `charClass`, um `delimited`,
 * ou `scope:<nome>` para o placeholder de um escopo aninhado — nesse caso `scope` aponta o nó
 * a descer sob demanda (via `G.into`), mantendo o conteúdo do escopo não-processado até ser pedido.
 */
type TLangToken = {
	/** Família do token (nome de `literal`, `charClass`, `delimited`) ou `scope:<nome>`. */
	kind: string;
	/** Texto do token. */
	value: string;
	/** Offset inicial na fonte. */
	start: number;
	/** Offset final (exclusivo) na fonte. */
	end: number;
	/** Nó do `Parser` a descer, quando o token é placeholder de escopo. */
	scope?: ParserNode;
};

/** Estado compartilhado durante um parse — passado a todo matcher. */
type TLangCtx = {
	/** Tokens do nível sendo parseado. */
	tokens: readonly TLangToken[];
	/** Raiz da árvore em construção (dá acesso à fonte). */
	readonly root: AstRoot;
	/** Regras nomeadas da espec, para `G.ref`. */
	readonly rules: ReadonlyMap<string, TRule>;
	/** Tokeniza (memoizado) o stream direto de um escopo — usado por `G.into` para descer sob demanda. */
	readonly descend: (node: ParserNode) => readonly TLangToken[];
	/** Memo packrat por regra nomeada: `"<rule>@<pos>"` → resultado. */
	readonly memo: Map<string, TLangMatch>;
	/** Posição de token mais distante em que algum matcher falhou (diagnóstico). */
	furthest: number;
};

/** O que um matcher capturou: um nó, opcionalmente rotulado como campo. */
type TLangCapture = {
	/** Nome do campo no nó que envolve a captura (`G.field`). */
	field?: string;
	/** Terminal (pontuação/keyword) — descartado por `G.node` se não for rotulado por `field`. */
	leaf?: boolean;
	/** O nó capturado. */
	node: AstNode;
};

/** Resultado de uma regra: casou (com a próxima posição e as capturas) ou não. */
type TLangMatch = { ok: true; next: number; captures: TLangCapture[] } | { ok: false };

/** Função de reconhecimento: consome tokens a partir de `pos`. */
type TRule = (ctx: TLangCtx, pos: number) => TLangMatch;

/** `error` quebra o build com `docs:check`; `warning` só aparece no relatório. */
type TDiagnosticSeverity = 'error' | 'warning';

/** Um problema encontrado numa fonte — estrutural (parser) ou de uma `TValidation`. */
type TDiagnostic = {
	/** Gravidade. */
	severity: TDiagnosticSeverity;
	/** Slug da regra que emitiu (`unclosed-scope`, `prefer-hash-private`, ...). */
	rule: string;
	/** Descrição para quem lê. */
	message: string;
	/** Arquivo analisado. */
	file: string;
	/** Linha 1-indexada. */
	line: number;
};

/** Contexto passado a uma `TValidation` — stream achatado (todos os níveis, com trivia) + AST. */
type TValidationCtx = {
	/** Arquivo analisado. */
	file: string;
	/** Fonte completa. */
	source: string;
	/** Todos os tokens do arquivo, de qualquer profundidade de escopo, trivia incluída. */
	tokens: readonly TLangToken[];
	/** Árvore da gramática. */
	root: AstRoot;
	/** Linha (1-indexada) de um offset. */
	lineAt: (offset: number) => number;
};

/** Uma regra de projeto (estilo ESLint) que roda depois da gramática em `Language.analyze`. */
type TValidation = {
	/** Slug da regra. */
	name: string;
	/** Devolve os diagnósticos encontrados. */
	check: (ctx: TValidationCtx) => TDiagnostic[];
};

/** Resultado de `Language.analyze` — a árvore + diagnósticos + o stream achatado. */
type TAnalysis = {
	/** A árvore. */
	root: AstRoot;
	/** Escopos não fechados, sintaxe não reconhecida e o que as validações acharam, por linha. */
	diagnostics: TDiagnostic[];
	/** Todos os tokens, de todos os níveis, com trivia. */
	tokens: readonly TLangToken[];
};

/** Gate compilado + o `kind` que os tokens daquele gate carregam.
 * @internal
 */
type TGateInfo = {
	kind: string;
	opaque: boolean;
	scopeName?: string;
	subtype?: (source: string, start: number, end: number) => string | undefined;
};

/** Autômato de literais + o `kind` (nome da família) de cada patternId.
 * @internal
 */
type TLiteralAutomaton = { automaton: AhoCorasick; kindOf: readonly string[] };

/** Tudo que `streamOf`/`flatten` precisam da linguagem compilada, num objeto só.
 * @internal
 */
type TScanContext = {
	source: string;
	infoByGate: Map<ParserGate, TGateInfo>;
	literals: TLiteralAutomaton;
	charClasses: [name: string, spec: TCharClassSpec][];
	trivia: ReadonlySet<string>;
};

export type {
	TLanguageSpec,
	TDelimitedSpec,
	TCharClassSpec,
	TLangToken,
	TLangCtx,
	TLangCapture,
	TLangMatch,
	TRule,
	TDiagnosticSeverity,
	TDiagnostic,
	TValidationCtx,
	TValidation,
	TAnalysis,
	TGateInfo,
	TLiteralAutomaton,
	TScanContext,
};
