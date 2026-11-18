import { JsDocUtils } from "./jsdoc"
import { TDeclaration, TFileDoc, TMember } from "./types"

type TApiModule = {
	name: string
	files: TFileDoc[]
	declarations: { file: TFileDoc; declaration: TDeclaration }[]
}

type TCoverageItem = {
	module: string
	file: string
	line: number
	name: string
	documented: boolean
}

const ROOT_MODULE = "core"

class ApiModel {
	static moduleOf(filePath: string): string {
		const parts = filePath.split("/").slice(1, -1)
		return parts.length === 0 ? ROOT_MODULE : parts.join("/")
	}

	static isPublic(file: TFileDoc, declaration: TDeclaration): boolean {
		return declaration.exported && !declaration.internal && !file.sideEffect
	}

	static modules(files: readonly TFileDoc[]): TApiModule[] {
		const byName = new Map<string, TApiModule>()
		for (const file of files) {
			const declarations = file.declarations.filter((declaration) => ApiModel.isPublic(file, declaration)).map((declaration) => ({ file, declaration }))
			if (declarations.length === 0) continue
			const name = ApiModel.moduleOf(file.path)
			const module = byName.get(name) ?? { name, files: [], declarations: [] }
			module.files.push(file)
			module.declarations.push(...declarations)
			byName.set(name, module)
		}
		return [...byName.values()].sort((left, right) => left.name.localeCompare(right.name))
	}

	static ownerDoc(declaration: TDeclaration, member: TMember) {
		if (member.doc !== undefined) return member.doc
		const owner = member.name.split(".")[0]
		if (owner === member.name) return undefined
		return declaration.members.find((candidate) => candidate.name === owner)?.doc
	}

	static coverage(modules: readonly TApiModule[]): TCoverageItem[] {
		return modules.flatMap((module) =>
			module.declarations.flatMap(({ file, declaration }) => {
				const own: TCoverageItem = { module: module.name, file: file.path, line: declaration.line, name: declaration.name, documented: JsDocUtils.isDocumented(declaration.doc) }
				if (declaration.kind === "const" || declaration.kind === "let" || declaration.kind === "var") return [own]
				const members = declaration.members.map((member) => ({
					module: module.name,
					file: file.path,
					line: member.line,
					name: `${declaration.name}.${member.name}`,
					documented:
						JsDocUtils.isDocumented(ApiModel.ownerDoc(declaration, member)) ||
						((member.kind === "enumMember" || member.kind === "constructor") && JsDocUtils.isDocumented(declaration.doc)),
				}))
				return [own, ...members]
			})
		)
	}
}

export { ApiModel, ROOT_MODULE }
export type { TApiModule, TCoverageItem }
