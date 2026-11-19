import { DEFAULT_BRANCH, PUBLISH_REGEX } from "./declarations"

class ReadmeUtils {
	static absoluteLinks(markdown: string, repositoryUrl: string | undefined): string {
		if (repositoryUrl === undefined) return markdown
		return markdown.replace(PUBLISH_REGEX.MARKDOWN_LINK, (match, target: string) => {
			const clean = target.replace(PUBLISH_REGEX.LEADING_DOT_SLASH, "")
			if (clean.startsWith("../")) return match
			return `](${repositoryUrl}/blob/${DEFAULT_BRANCH}/${clean})`
		})
	}

	static withApiNote(markdown: string, repositoryUrl: string | undefined): string {
		const fullReference = repositoryUrl === undefined ? "" : ` A referência completa fica em [docs/api](${repositoryUrl}/blob/${DEFAULT_BRANCH}/docs/api/README.md).`
		return `${markdown.trimEnd()}\n\n---\n\nO pacote traz \`API.md\`: todos os símbolos públicos, com um resumo de cada um.${fullReference}\n`
	}
}

export { ReadmeUtils }
