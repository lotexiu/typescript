import fs from "fs"
import path from "path"

type TResolvedAlias = { find: RegExp; replacement: string }

/**
 * Lê `compilerOptions.paths` do `tsconfig.json` de `projectDir` e devolve aliases no formato
 * que o Vite/Vitest esperam em `resolve.alias`, sem carregar o compiler API — os `paths`
 * deste projeto ficam no próprio `tsconfig.json` (não vêm do `extends`), então um
 * `JSON.parse` basta.
 *
 * `"@ts/*": ["./src/*"]` → `{ find: /^@ts(\/.*|$)/, replacement: "<abs>/src$1" }`
 */
function tsconfigAliases(projectDir: string): TResolvedAlias[] {
	const tsconfigPath = path.join(projectDir, "tsconfig.json")
	const { compilerOptions } = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"))
	const paths: Record<string, string[]> = compilerOptions?.paths ?? {}

	const trailingGlob = /\/\*$/
	const aliases: TResolvedAlias[] = []

	for (const [alias, targets] of Object.entries(paths)) {
		const cleanedAlias = alias.replace(trailingGlob, "")
		for (const target of targets) {
			const cleanedTarget = target.replace(trailingGlob, "")
			const absolute = path.resolve(projectDir, cleanedTarget)
			aliases.push({
				find: new RegExp(`^${cleanedAlias}(/.*|$)`),
				replacement: `${absolute}$1`,
			})
		}
	}

	return aliases
}

export {
	TResolvedAlias,
	tsconfigAliases,
}
