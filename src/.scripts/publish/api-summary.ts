import { ApiModel } from "../doc/api-model"
import { JsDocUtils } from "../doc/jsdoc"
import { TFileDoc } from "../doc/types"
import { DEFAULT_BRANCH, PUBLISH_REGEX } from "./declarations"

const KIND_LABELS: Readonly<Record<string, string>> = {
	class: "classe",
	interface: "interface",
	type: "tipo",
	function: "função",
	const: "constante",
	let: "variável",
	var: "variável",
	enum: "enum",
}

class ApiSummaryUtils {
	static summary(description: string): string {
		return description.split("\n\n")[0].replace(PUBLISH_REGEX.WHITESPACE_RUNS, " ").replace(PUBLISH_REGEX.TABLE_PIPE, "\\|").trim()
	}

	static render(packageName: string, version: string, files: readonly TFileDoc[], repositoryUrl: string | undefined): string {
		const modules = ApiModel.modules(files)
		const total = modules.reduce((sum, module) => sum + module.declarations.length, 0)
		const lines = [`# ${packageName} ${version} — API`, "", `${total} símbolos públicos em ${modules.length} módulos. Cada linha traz o resumo do JSDoc; o módulo leva à página completa.`]
		for (const module of modules) {
			const page = repositoryUrl === undefined ? undefined : `${repositoryUrl}/blob/${DEFAULT_BRANCH}/docs/api/${module.name}.md`
			lines.push("", page === undefined ? `## ${module.name}` : `## [${module.name}](${page})`, "", "| Símbolo | Tipo | Resumo |", "|---|---|---|")
			for (const { declaration } of module.declarations) {
				const summary = JsDocUtils.isDocumented(declaration.doc) ? ApiSummaryUtils.summary(declaration.doc!.description) : ""
				lines.push(`| \`${declaration.name}\` | ${KIND_LABELS[declaration.kind] ?? declaration.kind} | ${summary} |`)
			}
		}
		return lines.join("\n") + "\n"
	}
}

export { ApiSummaryUtils }
