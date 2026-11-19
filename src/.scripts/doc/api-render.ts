import path from "path"
import { ApiModel, TApiModule, TCoverageItem } from "./api-model"
import { DOC_REGEX } from "./declarations"
import { TDeclaration, TDoc, TFileDoc, TGlobalAugmentation, TMember } from "./types"

const GENERATED_NOTE = "_Gerado por `src/.scripts/doc/generate.ts` a partir do código-fonte — não editar à mão._"

const KIND_LABELS: Readonly<Record<string, string>> = {
	class: "classe",
	interface: "interface",
	type: "tipo",
	function: "função",
	const: "constante",
	let: "variável",
	var: "variável",
	enum: "enum",
	namespace: "namespace",
}

const MEMBER_GROUPS: readonly { title: string; accepts: (member: TMember) => boolean }[] = [
	{ title: "Construtor", accepts: (member) => member.kind === "constructor" },
	{ title: "Estáticos", accepts: (member) => member.isStatic && member.kind !== "enumMember" },
	{ title: "Propriedades", accepts: (member) => !member.isStatic && (member.kind === "property" || member.kind === "getter" || member.kind === "setter") },
	{ title: "Métodos", accepts: (member) => !member.isStatic && member.kind === "method" },
	{ title: "Valores", accepts: (member) => member.kind === "enumMember" },
]

class ApiRender {
	static pagePath(moduleName: string): string {
		return `${moduleName}.md`
	}

	static #anchor(name: string): string {
		return name.toLowerCase().replace(DOC_REGEX.NON_ANCHOR_CHARACTERS, "")
	}

	static #summary(doc: TDoc | undefined): string {
		const description = doc?.description ?? ""
		const firstSentence = description.split("\n\n")[0].replace(DOC_REGEX.WHITESPACE_RUNS, " ").trim()
		return firstSentence
	}

	static #code(text: string): string[] {
		return ["```ts", text, "```"]
	}

	static #tags(doc: TDoc | undefined): string[] {
		if (doc === undefined) return []
		const lines: string[] = []
		const parameters = doc.tags.filter((tag) => tag.name === "param" && tag.value !== undefined)
		if (parameters.length > 0) {
			lines.push("", "**Parâmetros**", "")
			for (const parameter of parameters) {
				const [name, ...rest] = parameter.value!.split(" ")
				lines.push(`- \`${name}\` — ${rest.join(" ").replace(DOC_REGEX.LEADING_DASH, "")}`)
			}
		}
		for (const tag of doc.tags) {
			if (tag.name === "returns" || tag.name === "return") lines.push("", `**Retorna:** ${tag.value ?? ""}`)
			if (tag.name === "deprecated") lines.push("", `> **Obsoleto.** ${tag.value ?? ""}`)
			if (tag.name === "see") lines.push("", `**Veja:** ${tag.value ?? ""}`)
			if (tag.name === "example" && tag.value !== undefined) {
				const example = tag.value.startsWith("```") ? tag.value.split("\n") : ApiRender.#code(tag.value)
				lines.push("", "**Exemplo**", "", ...example)
			}
		}
		return lines
	}

	static #member(declaration: TDeclaration, member: TMember): string[] {
		const doc = ApiModel.ownerDoc(declaration, member)
		const ownDescription = member.doc?.description ?? ""
		const description = ownDescription !== "" && !member.name.includes(".") ? ownDescription : member.name.includes(".") ? "" : (doc?.description ?? "")
		return ["", `#### \`${member.signature.replace(DOC_REGEX.NEWLINE_INDENT, " ")}\``, ...(description === "" ? [] : ["", description]), ...ApiRender.#tags(member.doc)]
	}

	static #heritage(declaration: TDeclaration, pageDirectory: string, symbols: ReadonlyMap<string, string>): string[] {
		const match = DOC_REGEX.EXTENDS.exec(declaration.signature)
		if (match === null) return []
		const base = match[1]
		const page = symbols.get(base)
		if (page === undefined) return ["", `Estende \`${base}\`.`]
		const link = path.relative(pageDirectory, page).split(path.sep).join("/")
		return ["", `Estende [\`${base}\`](${link}#${ApiRender.#anchor(base)}) — os membros herdados estão documentados lá.`]
	}

	static #declaration(file: TFileDoc, declaration: TDeclaration, pageDirectory: string, symbols: ReadonlyMap<string, string>): string[] {
		const source = path.relative(pageDirectory, file.path).split(path.sep).join("/")
		const lines = [
			"",
			"---",
			"",
			`## \`${declaration.name}\``,
			"",
			`${KIND_LABELS[declaration.kind] ?? declaration.kind} · [${file.path}:${declaration.line}](${source}#L${declaration.line})`,
		]
		if (declaration.doc?.description) lines.push("", declaration.doc.description)
		lines.push("", ...ApiRender.#code(declaration.signature), ...ApiRender.#heritage(declaration, pageDirectory, symbols), ...ApiRender.#tags(declaration.doc))
		for (const group of MEMBER_GROUPS) {
			const members = declaration.members.filter(group.accepts)
			if (members.length === 0) continue
			lines.push("", `### ${group.title}`)
			for (const member of members) lines.push(...ApiRender.#member(declaration, member))
		}
		return lines
	}

	static symbolPages(modules: readonly TApiModule[], docsDirectory: string): Map<string, string> {
		const pages = new Map<string, string>()
		for (const module of modules) {
			for (const { declaration } of module.declarations) pages.set(declaration.name, path.join(docsDirectory, ApiRender.pagePath(module.name)))
		}
		return pages
	}

	static modulePage(module: TApiModule, docsDirectory: string, symbols: ReadonlyMap<string, string>): string {
		const pageDirectory = path.dirname(path.join(docsDirectory, ApiRender.pagePath(module.name)))
		const readme = path.relative(pageDirectory, path.join(docsDirectory, "README.md")).split(path.sep).join("/")
		const lines = [`# \`${module.name}\``, "", GENERATED_NOTE, "", `[← Índice da API](${readme})`, "", "| Símbolo | Tipo | Resumo |", "|---|---|---|"]
		for (const { declaration } of module.declarations) {
			lines.push(`| [\`${declaration.name}\`](#${ApiRender.#anchor(declaration.name)}) | ${KIND_LABELS[declaration.kind] ?? declaration.kind} | ${ApiRender.#summary(declaration.doc).replace(DOC_REGEX.TABLE_PIPE, "\\|")} |`)
		}
		for (const { file, declaration } of module.declarations) lines.push(...ApiRender.#declaration(file, declaration, pageDirectory, symbols))
		return lines.join("\n") + "\n"
	}

	static globalsPage(globals: readonly { file: TFileDoc; augmentation: TGlobalAugmentation }[]): string {
		const lines = ["# Extensões globais", "", GENERATED_NOTE, "", "[← Índice da API](README.md)", "", "Ao importar a lib, estes métodos passam a existir nos tipos nativos (`declare global` em `src/declarations.ts`). Cada um repete o utilitário estático de mesmo nome, recebendo o valor como `this`."]
		for (const { file, augmentation } of globals) {
			lines.push("", `## \`${augmentation.name}\``, "", `[${file.path}:${augmentation.line}](../../${file.path}#L${augmentation.line})`, "")
			for (const member of augmentation.members) lines.push(`- \`${member.signature.replace(DOC_REGEX.NEWLINE_INDENT, " ")}\``)
		}
		return lines.join("\n") + "\n"
	}

	static indexPage(packageName: string, modules: readonly TApiModule[], coverage: readonly TCoverageItem[], hasGlobals: boolean): string {
		const documented = coverage.filter((item) => item.documented).length
		const lines = [
			`# Referência da API — \`${packageName}\``,
			"",
			GENERATED_NOTE,
			"",
			"Tudo o que o pacote exporta, agrupado pela pasta de origem em `src/`. As assinaturas são recortadas do código; os textos vêm do JSDoc. Símbolos marcados com `@internal` ficam de fora.",
			"",
			`Cobertura de documentação: **${documented}/${coverage.length}** (${ApiRender.percent(documented, coverage.length)}). Detalhes em [COVERAGE.md](../COVERAGE.md).`,
			"",
			"| Módulo | Símbolos | Documentados |",
			"|---|---|---|",
		]
		for (const module of modules) {
			const items = coverage.filter((item) => item.module === module.name)
			const done = items.filter((item) => item.documented).length
			lines.push(`| [\`${module.name}\`](${ApiRender.pagePath(module.name)}) | ${module.declarations.length} | ${ApiRender.percent(done, items.length)} |`)
		}
		if (hasGlobals) lines.push("", "Veja também: [extensões globais](globals.md) (`String`, `Function`, …).")
		return lines.join("\n") + "\n"
	}

	static percent(part: number, total: number): string {
		return total === 0 ? "100%" : `${Math.floor((part / total) * 100)}%`
	}
}

export { ApiRender }
