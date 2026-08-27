import fs from "fs"
import path from "path"
import { extractFile, walkSourceFiles, TFileDoc, TDeclaration } from "./extract"

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, "src")
const OUT_FILE = path.join(ROOT, "docs/EXTRACTED.md")

/** Escreve só quando o conteúdo muda — mesmo motivo de `AnalyzerProject.writeFile`. */
function writeIfChanged(filePath: string, content: string): boolean {
	if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf-8") === content) return false
	fs.mkdirSync(path.dirname(filePath), { recursive: true })
	fs.writeFileSync(filePath, content)
	return true
}

function renderDeclaration(declaration: TDeclaration): string {
	const lines: string[] = []
	const flag = declaration.exported ? "exported" : "local"
	lines.push(`#### \`${declaration.name}\` — ${declaration.kind} _(${flag}, L${declaration.line})_`)

	if (declaration.doc?.description) {
		lines.push("")
		lines.push(declaration.doc.description)
	}
	if (declaration.doc?.tags.length) {
		lines.push("")
		for (const tag of declaration.doc.tags) {
			lines.push(`- \`@${tag.name}\`${tag.value ? ` ${tag.value}` : ""}`)
		}
	}
	return lines.join("\n")
}

function renderFile(fileDoc: TFileDoc): string {
	const lines = [`## ${fileDoc.path}`, ""]
	if (!fileDoc.declarations.length) {
		lines.push("_Sem declarações top-level._")
		return lines.join("\n")
	}
	lines.push(fileDoc.declarations.map(renderDeclaration).join("\n\n"))
	return lines.join("\n")
}

function render(fileDocs: TFileDoc[]): string {
	const total = fileDocs.reduce((sum, file) => sum + file.declarations.length, 0)
	const header = [
		"# Documentação extraída",
		"",
		"_Gerado por `scripts/doc/generate.ts` — extração puramente sintática, sem type-checker._",
		"",
		`${fileDocs.length} arquivos, ${total} declarações top-level.`,
		"",
		"---",
		"",
	]
	return header.join("\n") + fileDocs.map(renderFile).join("\n\n") + "\n"
}

function main(): void {
	const files = walkSourceFiles(SRC_DIR)
	const fileDocs = files
		.map((file) => extractFile(file, path.relative(ROOT, file).replace(/\\/g, "/")))
		.filter((fileDoc) => fileDoc.declarations.length > 0)

	const changed = writeIfChanged(OUT_FILE, render(fileDocs))
	const total = fileDocs.reduce((sum, file) => sum + file.declarations.length, 0)
	console.log(
		`${changed ? "wrote" : "unchanged"} docs/EXTRACTED.md — ${total} declarações em ${fileDocs.length} arquivos`,
	)
}

main()
