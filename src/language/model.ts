import { Parser } from "@ts/parser/model"
import { ParserGate, ParserNode } from "@ts/parser/node/model"
import { LanguageUtils, TGateInfo, TLiteralAutomaton, TScanContext } from "./utils"
import type { TAnalysis, TDiagnostic, TLangCtx, TLangToken, TLanguageSpec, TRule } from "./types"
import { AstRoot } from "./node/model";

/**
 * Linguagem compilada de uma única `TLanguageSpec`. `parse` faz 1 passada estrutural (o
 * `Parser` monta a árvore de escopo) e roda a gramática sobre o stream de tokens — descendo
 * em escopos aninhados só quando uma regra pede (`G.into`); `G.placeholder` deixa o escopo
 * como folha, sem processar o conteúdo. `analyze` acrescenta diagnósticos (escopos não
 * fechados + as `TValidation`s da espec).
 *
 * Protótipo: `parse` ainda percorre a gramática inteira de forma eager (todo escopo
 * alcançável acaba materializado). O corte real de lazy é o próximo passo — `descend` /
 * `G.into` / `G.placeholder` já são o gancho.
 */
class Language {
	readonly #spec: TLanguageSpec
	readonly #rules: ReadonlyMap<string, TRule>
	readonly #infoByGate: Map<ParserGate, TGateInfo>
	readonly #literals: TLiteralAutomaton
	readonly #trivia: ReadonlySet<string>
	readonly #charClasses: [name: string, spec: TLanguageSpec["charClass"][string]][]
	readonly #parser = new Parser()

	constructor(spec: TLanguageSpec) {
		this.#spec = spec
		this.#rules = new Map(Object.entries(spec.grammar))
		this.#literals = LanguageUtils.compileLiterals(spec)
		this.#trivia = LanguageUtils.triviaKinds(spec)
		this.#charClasses = Object.entries(spec.charClass)

		const { gates, infoByGate } = LanguageUtils.compileGates(spec)
		this.#infoByGate = infoByGate
		this.#parser.trackGaps = true
		if (spec.escape) this.#parser.escape = spec.escape
		this.#parser.addGates(...gates)
	}

	static define(spec: TLanguageSpec): Language {
		return new Language(spec)
	}

	#scanContext(source: string): TScanContext {
		return {
			source,
			infoByGate: this.#infoByGate,
			literals: this.#literals,
			charClasses: this.#charClasses,
			trivia: this.#trivia,
		}
	}

	#run(source: string, astRoot: AstRoot): void {
		const scopeRoot = this.#parser.root
		const scan = this.#scanContext(source)

		const streamCache = new Map<ParserNode, readonly TLangToken[]>()
		const descend = (node: ParserNode): readonly TLangToken[] => {
			let stream = streamCache.get(node)
			if (!stream) {
				stream = LanguageUtils.streamOf(node, scan)
				streamCache.set(node, stream)
			}
			return stream
		}

		const ctx: TLangCtx = {
			tokens: LanguageUtils.streamOf(scopeRoot, scan),
			root: astRoot,
			rules: this.#rules,
			descend,
			memo: new Map(),
			furthest: 0,
		}

		const start = this.#rules.get(this.#spec.start)
		if (!start) throw new Error(`Language: regra-start "${this.#spec.start}" não registrada`)

		const result = start(ctx, 0)
		if (result.ok) {
			for (const capture of result.captures) {
				if (!capture.field && capture.leaf) continue
				capture.node.parent = astRoot
				astRoot.children.push(capture.node)
			}
		}
	}

	parse(source: string): AstRoot {
		this.#parser.text.set(source)
		const astRoot = new AstRoot(source)
		this.#run(source, astRoot)
		return astRoot
	}

	/** `parse` + escopos não fechados (erro) + as `TValidation`s da espec, sobre o stream achatado. */
	analyze(source: string, file = "<anon>"): TAnalysis {
		this.#parser.text.set(source)
		const astRoot = new AstRoot(source)
		this.#run(source, astRoot)

		const diagnostics: TDiagnostic[] = []

		for (const node of this.#parser.root.nodes) {
			if (!node.unclosed) continue
			const info = this.#infoByGate.get(node.gate)!
			diagnostics.push({
				severity: "error",
				rule: "unclosed-scope",
				message: `escopo "${info.scopeName ?? info.kind}" aberto em ${node.start} nunca foi fechado`,
				file,
				line: astRoot.lineAt(node.start),
			})
		}

		const tokens = LanguageUtils.flatten(this.#parser.root, this.#scanContext(source))
		for (const validation of this.#spec.validate ?? []) {
			diagnostics.push(...validation.check({
				file,
				source,
				tokens,
				root: astRoot,
				lineAt: (offset) => astRoot.lineAt(offset),
			}))
		}

		diagnostics.sort((a, b) => a.line - b.line)
		return { root: astRoot, diagnostics, tokens }
	}
}

export {
	Language,
}
