import { TDiagnostic } from "@ts/language/types";
import path from "path"
import { TDeclaration, TFileDoc, extractFile, walkSourceFiles } from "./extract";
import { buildIndex } from "./index-gen";
import { writeIfChanged } from "./write-if-changed";

/**
 * Roda a extração sintática (via `src/language` + `TypescriptLang`) sobre `src/**​/*.ts` e escreve:
 *  - `docs/EXTRACTED.md`   — dump das declarações top-level + JSDoc (cru, não formatado)
 *  - `src/index.ts`        — o entry gerado (re-exports + side-effects)
 *  - `docs/DIAGNOSTICS.md` — erros (escopo não fechado) e avisos (validações de `TypescriptLang`)
 *
 * Não roda no build nem como plugin do Vite — por enquanto é `tsx scripts/doc/generate.ts`.
 */

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, "src")
const ENTRY = "src/index.ts"
const DOCS_FILE = path.join(ROOT, "docs/EXTRACTED.md")
const DIAGNOSTICS_FILE = path.join(ROOT, "docs/DIAGNOSTICS.md")

// ---------- docs/EXTRACTED.md ----------

function renderDeclaration(declaration: TDeclaration): string {
	const flag = declaration.exported ? "exported" : "local"
	const lines = [`#### \`${declaration.name}\` — ${declaration.kind} _(${flag}, L${declaration.line})_`]
	if (declaration.doc?.description) lines.push("", declaration.doc.description)
	if (declaration.doc?.tags.length) {
		lines.push("")
		for (const tag of declaration.doc.tags) lines.push(`- \`@${tag.name}\`${tag.value ? ` ${tag.value}` : ""}`)
	}
	return lines.join("\n")
}

function renderFileDoc(fileDoc: TFileDoc): string {
	const lines = [`## ${fileDoc.path}`, ""]
	if (!fileDoc.declarations.length) return lines.concat("_Sem declarações top-level._").join("\n")
	return lines.concat(fileDoc.declarations.map(renderDeclaration).join("\n\n")).join("\n")
}

function renderDocs(fileDocs: TFileDoc[]): string {
	const total = fileDocs.reduce((sum, file) => sum + file.declarations.length, 0)
	const header = [
		"# Documentação extraída",
		"",
		"_Gerado por `scripts/doc/generate.ts` — extração puramente sintática (`src/language` + `TypescriptLang`), sem type-checker._",
		"",
		`${fileDocs.length} arquivos, ${total} declarações top-level.`,
		"",
		"---",
		"",
	]
	return header.join("\n") + fileDocs.map(renderFileDoc).join("\n\n") + "\n"
}

// ---------- docs/DIAGNOSTICS.md ----------

function renderDiagnostics(entries: { file: string; diagnostics: TDiagnostic[] }[]): string {
	const all = entries.flatMap((entry) => entry.diagnostics)
	const errors = all.filter((diagnostic) => diagnostic.severity === "error")
	const warnings = all.filter((diagnostic) => diagnostic.severity === "warning")

	const lines = [
		"# Diagnósticos",
		"",
		"_Gerado por `scripts/doc/generate.ts`._",
		"",
		`${errors.length} erro(s), ${warnings.length} aviso(s).`,
		"",
	]

	for (const [title, list] of [["Erros", errors], ["Avisos", warnings]] as const) {
		lines.push(`## ${title}`, "")
		if (!list.length) {
			lines.push("_Nenhum._", "")
			continue
		}
		for (const diagnostic of list) {
			lines.push(`- \`${diagnostic.file}:${diagnostic.line}\` **${diagnostic.rule}** — ${diagnostic.message}`)
		}
		lines.push("")
	}

	return lines.join("\n")
}

// ---------- run ----------

function main(): void {
	const files = walkSourceFiles(SRC_DIR).map((absolute) =>
		extractFile(absolute, path.relative(ROOT, absolute).replace(/\\/g, "/")),
	)

	const withDeclarations = files.filter((file) => file.declarations.length > 0)
	const docsChanged = writeIfChanged(DOCS_FILE, renderDocs(withDeclarations))

	const indexContent = buildIndex(files, path.dirname(ENTRY).replace(/\\/g, "/"), ENTRY)
	const indexChanged = writeIfChanged(path.join(ROOT, ENTRY), indexContent)

	const diagnosticsChanged = writeIfChanged(
		DIAGNOSTICS_FILE,
		renderDiagnostics(files.map((file) => ({ file: file.path, diagnostics: file.diagnostics }))),
	)

	const totalDeclarations = withDeclarations.reduce((sum, file) => sum + file.declarations.length, 0)
	const totalDiagnostics = files.reduce((sum, file) => sum + file.diagnostics.length, 0)
	console.log(`docs/EXTRACTED.md   ${docsChanged ? "wrote" : "unchanged"} — ${totalDeclarations} declarações / ${withDeclarations.length} arquivos`)
	console.log(`src/index.ts        ${indexChanged ? "wrote" : "unchanged"}`)
	console.log(`docs/DIAGNOSTICS.md ${diagnosticsChanged ? "wrote" : "unchanged"} — ${totalDiagnostics} diagnóstico(s)`)
}

main()
