import type { ParserNode } from "@ts/parser/node/model"
import { AstNode, AstRoot } from "./node/model";

/**
 * Espec declarativa de uma linguagem — fonte única para o autômato, a tokenização e a
 * gramática. Não há um "conjunto de regras do lexer" separado: `scope`/`delimited`/`literal`
 * já são tudo que o scanner precisa, e a gramática referencia esses mesmos `kind`s.
 */
type TLanguageSpec = {
	/** Delimitadores pareados que formam a árvore de escopo (transparentes — conteúdo é tokenizado). */
	scope: Record<string, readonly [open: string, close: string]>
	/** Regiões opacas: nada dentro é tokenizado, o bloco inteiro vira 1 token do `kind` da família. */
	delimited: Record<string, TDelimitedSpec | readonly TDelimitedSpec[]>
	/** Classes de caractere por predicado (identificador, número, espaço, ...). */
	charClass: Record<string, TCharClassSpec>
	/** Famílias de literais (keywords, operadores, pontuação). Alimentam o autômato; o `kind` do token é o nome da família. */
	literal: Record<string, readonly string[]>
	/** Regras nomeadas da gramática, montadas com os combinadores de `G`. */
	grammar: Record<string, TRule>
	/** Nome da regra de entrada. */
	start: string
	/** Caractere de escape (ex: `"\\"`) — um `open`/`close`/`${` precedido por ele em número ímpar não conta. */
	escape?: string
	/**
	 * Validações extras (camada estilo ESLint) — rodam sobre o stream achatado + a AST e
	 * emitem `TDiagnostic`s. Separadas da gramática de propósito: a gramática são as regras
	 * absolutas da linguagem, isto é opt-in (regras de projeto/framework).
	 */
	validate?: readonly TValidation[]
}

type TDelimitedSpec = {
	open: string
	close: string
	/** false = o `close` não entra no token (ex: comentário de linha terminado por `\n`). Default: true. */
	consumeClose?: boolean
	/** Marca o `kind` como trivia — filtrado antes da gramática. */
	trivia?: boolean
	/**
	 * Roda 1x por match (offsets, não o `value` fatiado). Retornar um `kind` troca o `kind`
	 * do token só nesse match (ex: `/**` dentro de `blockComment` virar `jsdoc`); o teste de
	 * trivia é refeito sobre o `kind` final.
	 */
	subtype?: (source: string, start: number, end: number) => string | undefined
	/**
	 * Semi-transparente: opaco **exceto** por janelas `[open, close]` que voltam a ser código
	 * (o `${ … }` de uma template string). Em vez de 1 token só, o stream recebe pedaços de
	 * texto (`kind` da família) alternados com placeholders de escopo `scope:<nome>Interp`,
	 * nos quais a gramática pode descer (`G.into`).
	 */
	interpolate?: readonly [open: string, close: string]
	invalidBy?: (code: number) => boolean | {before: (code: number) => boolean; after: (code: number) => boolean}
}

type TCharClassSpec = {
	/** Testado no 1º char do run. */
	start: (code: number) => boolean
	/** Testado do 2º char em diante. Default: mesmo predicado de `start`. */
	continue?: (code: number) => boolean
	/** Marca o `kind` como trivia — filtrado antes da gramática. */
	trivia?: boolean
}

/**
 * Token achatado. `kind` é o nome de uma família de `literal`, uma `charClass`, um `delimited`,
 * ou `scope:<nome>` para o placeholder de um escopo aninhado — nesse caso `scope` aponta o nó
 * a descer sob demanda (via `G.into`), mantendo o conteúdo do escopo não-processado até ser pedido.
 */
type TLangToken = {
	kind: string
	value: string
	start: number
	end: number
	scope?: ParserNode
}

/** Estado compartilhado durante um parse — passado a todo matcher. */
type TLangCtx = {
	tokens: readonly TLangToken[]
	readonly root: AstRoot
	readonly rules: ReadonlyMap<string, TRule>
	/** Tokeniza (memoizado) o stream direto de um escopo — usado por `G.into` para descer sob demanda. */
	readonly descend: (node: ParserNode) => readonly TLangToken[]
	/** Memo packrat por regra nomeada: `"<rule>@<pos>"` → resultado. */
	readonly memo: Map<string, TLangMatch>
	/** Posição de token mais distante em que algum matcher falhou (diagnóstico). */
	furthest: number
}

type TLangCapture = {
	field?: string
	/** Terminal (pontuação/keyword) — descartado por `G.node` se não for rotulado por `field`. */
	leaf?: boolean
	node: AstNode
}

type TLangMatch =
	| { ok: true; next: number; captures: TLangCapture[] }
	| { ok: false }

/** Função de reconhecimento: consome tokens a partir de `pos`. */
type TRule = (ctx: TLangCtx, pos: number) => TLangMatch

type TDiagnosticSeverity = "error" | "warning"

/** Um problema encontrado numa fonte — estrutural (parser) ou de uma `TValidation`. */
type TDiagnostic = {
	severity: TDiagnosticSeverity
	/** Slug da regra que emitiu (`unclosed-scope`, `prefer-hash-private`, ...). */
	rule: string
	message: string
	file: string
	/** Linha 1-indexada. */
	line: number
}

/** Contexto passado a uma `TValidation` — stream achatado (todos os níveis, com trivia) + AST. */
type TValidationCtx = {
	file: string
	source: string
	/** Todos os tokens do arquivo, de qualquer profundidade de escopo, trivia incluída. */
	tokens: readonly TLangToken[]
	root: AstRoot
	lineAt: (offset: number) => number
}

type TValidation = {
	name: string
	check: (ctx: TValidationCtx) => TDiagnostic[]
}

/** Resultado de `Language.analyze` — a árvore + diagnósticos + o stream achatado. */
type TAnalysis = {
	root: AstRoot
	diagnostics: TDiagnostic[]
	tokens: readonly TLangToken[]
}

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
}
