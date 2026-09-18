import { AhoCorasick } from "@ts/aho-corasick/model";
import { ParserGate, ParserNode, ParserRoot } from "@ts/parser/node/model";
import { SCOPE_KIND_PREFIX } from "./declarations";
import type { TGateInfo, TLangToken, TLanguageSpec, TLiteralAutomaton, TScanContext } from "./types";

/**
 * Helpers estáticos da `Language` — compilação da espec e tokenização de um escopo. Todas as
 * chamadas entre irmãos via `LanguageUtils.x`, nunca `this`.
 */
class LanguageUtils {
	/** Um `ParserGate` por `scope` (transparente) e por `delimited` (opaco), com o mapa gate → `kind`. */
	static compileGates(spec: TLanguageSpec): { gates: ParserGate[]; infoByGate: Map<ParserGate, TGateInfo> } {
		const gates: ParserGate[] = []
		const infoByGate = new Map<ParserGate, TGateInfo>()

		for (const [name, [open, close]] of Object.entries(spec.scope)) {
			const gate = new ParserGate(open, close, false)
			gates.push(gate)
			infoByGate.set(gate, { kind: SCOPE_KIND_PREFIX + name, opaque: false, scopeName: name })
		}

		for (const [name, value] of Object.entries(spec.delimited)) {
			for (const one of Array.isArray(value) ? value : [value]) {
				let holeGate: ParserGate | null = null
				if (one.interpolate) {
					holeGate = new ParserGate(one.interpolate[0], one.interpolate[1], false)
					infoByGate.set(holeGate, { kind: SCOPE_KIND_PREFIX + name + "Interp", opaque: false, scopeName: name + "Interp" })
				}
				const gate = new ParserGate(one.open, one.close, true, one.consumeClose ?? true, holeGate)
				gates.push(gate)
				infoByGate.set(gate, { kind: name, opaque: true, subtype: one.subtype })
			}
		}

		return { gates, infoByGate }
	}

	/** Um autômato Aho-Corasick sobre todos os `literal` da espec — os terminais da gramática são exatamente estes. */
	static compileLiterals(spec: TLanguageSpec): TLiteralAutomaton {
		const patterns: string[] = []
		const kindOf: string[] = []
		for (const [family, values] of Object.entries(spec.literal)) {
			for (const value of values) {
				patterns.push(value)
				kindOf.push(family)
			}
		}
		return { automaton: AhoCorasick.compile(...patterns), kindOf }
	}

	/** `kind`s marcados `trivia` (charClass ou delimited) — filtrados antes da gramática. */
	static triviaKinds(spec: TLanguageSpec): Set<string> {
		const kinds = new Set<string>()
		for (const [name, cc] of Object.entries(spec.charClass)) if (cc.trivia) kinds.add(name)
		for (const [name, value] of Object.entries(spec.delimited)) {
			const all = Array.isArray(value) ? value : [value]
			if (all.some((one) => one.trivia)) kinds.add(name)
		}
		return kinds
	}

	/**
	 * Stream direto de um escopo: gaps tokenizados finamente, intercalados com 1 token por
	 * filho — placeholder (`scope:<nome>`, com `scope` apontando o nó) para escopo aninhado,
	 * ou 1 token opaco para `delimited`. Não desce em escopo nenhum. Trivia é filtrada quando
	 * `keepTrivia` é `false`.
	 */
	static streamOf(scope: ParserRoot | ParserNode, ctx: TScanContext, keepTrivia = false): TLangToken[] {
		const tokens: TLangToken[] = []
		LanguageUtils.#emitScope(scope, ctx, keepTrivia, false, tokens)
		return tokens
	}

	/**
	 * Stream achatado do arquivo inteiro: desce recursivamente em todos os escopos e devolve
	 * cada token em ordem de fonte, trivia incluída. Base das `TValidation`s (que precisam ver
	 * o que a gramática, por ser lazy, nunca tocou — ex: `private` dentro de um corpo de classe).
	 */
	static flatten(scope: ParserRoot | ParserNode, ctx: TScanContext): TLangToken[] {
		const tokens: TLangToken[] = []
		LanguageUtils.#emitScope(scope, ctx, true, true, tokens)
		return tokens
	}

	static #emitScope(
		scope: ParserRoot | ParserNode,
		ctx: TScanContext,
		keepTrivia: boolean,
		recurse: boolean,
		out: TLangToken[],
	): void {
		const { source, infoByGate } = ctx
		const { children, gaps } = scope
		let childIndex = 0
		let gapIndex = 0

		while (childIndex < children.length || gapIndex < gaps.length) {
			const child = children[childIndex]
			const gap = gaps[gapIndex]
			if (child && (!gap || child.start < gap.start)) {
				const info = infoByGate.get(child.gate)!
				const value = source.slice(child.start, child.end)
				if (child.gate.holeGate) {
					LanguageUtils.#emitSemiTransparent(child, info.kind, ctx, keepTrivia, recurse, out)
				} else if (info.opaque) {
					const kind = info.subtype?.(source, child.start, child.end) ?? info.kind
					if (keepTrivia || !ctx.trivia.has(kind)) out.push({ kind, value, start: child.start, end: child.end })
				} else if (recurse) {
					LanguageUtils.#emitScope(child, ctx, keepTrivia, true, out)
				} else {
					out.push({ kind: info.kind, value, start: child.start, end: child.end, scope: child })
				}
				childIndex++
			} else {
				LanguageUtils.#scanGap(source, gap.start, gap.end, ctx, keepTrivia, out)
				gapIndex++
			}
		}
	}

	/**
	 * Emite uma template string semi-transparente: pedaços de texto literal (`kind` da família,
	 * cru — não tokenizados) alternados, em ordem de fonte, com os `${ … }` — que viram
	 * placeholder de escopo (`recurse` falso) ou são achatados recursivamente (`recurse` true).
	 * Os delimitadores (`` ` `` / `${` / `}`) não entram no stream nesta fatia.
	 */
	static #emitSemiTransparent(
		node: ParserNode,
		familyKind: string,
		ctx: TScanContext,
		keepTrivia: boolean,
		recurse: boolean,
		out: TLangToken[],
	): void {
		const { source } = ctx
		const { children, gaps } = node
		let childIndex = 0
		let gapIndex = 0

		while (childIndex < children.length || gapIndex < gaps.length) {
			const hole = children[childIndex]
			const gap = gaps[gapIndex]
			if (hole && (!gap || hole.start < gap.start)) {
				if (recurse) {
					LanguageUtils.#emitScope(hole, ctx, keepTrivia, true, out)
				} else {
					const info = ctx.infoByGate.get(hole.gate)!
					out.push({ kind: info.kind, value: source.slice(hole.start, hole.end), start: hole.start, end: hole.end, scope: hole })
				}
				childIndex++
			} else {
				out.push({ kind: familyKind, value: source.slice(gap.start, gap.end), start: gap.start, end: gap.end })
				gapIndex++
			}
		}
	}

	/** Maximal munch num gap: em cada posição o candidato mais longo vence; empate favorece `literal`. */
	static #scanGap(
		source: string,
		from: number,
		to: number,
		ctx: TScanContext,
		keepTrivia: boolean,
		out: TLangToken[],
	): void {
		const bestLiteralAt = new Map<number, { length: number; kind: string }>()
		ctx.literals.automaton.scan(source, {
			onMatch: (patternId, matchStart, matchEnd) => {
				const length = matchEnd - matchStart
				const current = bestLiteralAt.get(matchStart)
				if (!current || length > current.length) {
					bestLiteralAt.set(matchStart, { length, kind: ctx.literals.kindOf[patternId] })
				}
				return false
			},
		}, from, to)

		let i = from
		while (i < to) {
			const code = source.charCodeAt(i)
			const literal = bestLiteralAt.get(i)
			let bestLength = literal ? literal.length : 0
			let bestKind: string | null = literal ? literal.kind : null

			for (const [name, cc] of ctx.charClasses) {
				if (!cc.start(code)) continue
				const cont = cc.continue ?? cc.start
				let j = i + 1
				while (j < to && cont(source.charCodeAt(j))) j++
				const length = j - i
				if (length > bestLength) {
					bestLength = length
					bestKind = name
				}
			}

			if (bestKind === null) {
				out.push({ kind: "unknown", value: source[i], start: i, end: i + 1 })
				i += 1
				continue
			}
			const end = i + bestLength
			if (keepTrivia || !ctx.trivia.has(bestKind)) {
				out.push({ kind: bestKind, value: source.slice(i, end), start: i, end })
			}
			i = end
		}
	}
}

export {
	LanguageUtils,
}
export type {
	TGateInfo,
	TLiteralAutomaton,
	TScanContext,
}
