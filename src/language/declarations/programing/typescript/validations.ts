import type { TValidation } from "@ts/language/types"

/**
 * Validações extras para fonte TypeScript — camada opt-in, estilo ESLint. A gramática de
 * `TypescriptLang` são as regras absolutas da linguagem; isto são preferências (de projeto/estilo).
 */

/**
 * `private`/`protected`/`public` do TypeScript num membro de classe → sugere `#` (privado
 * real de runtime, não apagado na compilação). Aviso, não erro. Cobre também
 * `constructor(private x: ...)`.
 */
const preferHashPrivate: TValidation = {
	name: "prefer-hash-private",
	check(ctx) {
		return ctx.tokens
			.filter((token) => token.kind === "keyword" && token.value === "private")
			.map((token) => ({
				severity: "warning" as const,
				rule: "prefer-hash-private",
				message: "`private` do TypeScript — prefira `#nome` (privado real de runtime)",
				file: ctx.file,
				line: ctx.lineAt(token.start),
			}))
	},
}

const TS_VALIDATIONS: readonly TValidation[] = [
	preferHashPrivate,
]

export {
	preferHashPrivate,
	TS_VALIDATIONS,
}
