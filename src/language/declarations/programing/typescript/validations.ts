import type { TLangToken, TValidation } from "@ts/language/types"

const TRIVIA_KINDS: ReadonlySet<string> = new Set(["space", "newline", "blockComment", "lineComment"])

function nextMeaningfulToken(tokens: readonly TLangToken[], index: number): TLangToken | undefined {
	for (let position = index + 1; position < tokens.length; position++) {
		if (!TRIVIA_KINDS.has(tokens[position].kind)) return tokens[position]
	}
	return undefined
}

/**
 * Validações extras para fonte TypeScript — camada opt-in, estilo ESLint. A gramática de
 * `TypescriptLang` são as regras absolutas da linguagem; isto são preferências (de projeto/estilo).
 */

/**
 * `private` do TypeScript num membro de classe → sugere `#` (privado real de runtime, não
 * apagado na compilação). Aviso, não erro. Cobre também `constructor(private x: ...)`.
 * Ignora `private constructor`: JavaScript não tem construtor `#`.
 */
const preferHashPrivate: TValidation = {
	name: "prefer-hash-private",
	check(ctx) {
		return ctx.tokens
			.filter((token, index) => token.kind === "keyword" && token.value === "private" && nextMeaningfulToken(ctx.tokens, index)?.value !== "constructor")
			.map((token) => ({
				severity: "warning" as const,
				rule: "prefer-hash-private",
				message: "`private` do TypeScript — prefira `#nome` (privado real de runtime)",
				file: ctx.file,
				line: ctx.lineAt(token.start),
			}))
	},
}

/** Todas as validações opcionais de TypeScript, para `validate` de uma espec. */
const TS_VALIDATIONS: readonly TValidation[] = [
	preferHashPrivate,
]

export {
	preferHashPrivate,
	TS_VALIDATIONS,
}
