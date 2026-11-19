import { TDiagnostic } from "@ts/language/types"
import fs from "fs"
import path from "path"
import { ApiModel, TCoverageItem } from "./api-model"
import { ApiRender } from "./api-render"
import { extractFile, toPosixPath, walkSourceFiles } from "./extract"
import { buildIndex } from "./index-gen"
import { TFileDoc } from "./types"
import { writeIfChanged } from "./write-if-changed"

const ROOT = process.cwd()
const SOURCE_DIRECTORY = path.join(ROOT, "src")
const ENTRY = "src/index.ts"
const API_DIRECTORY = path.join(ROOT, "docs/api")
const DIAGNOSTICS_FILE = path.join(ROOT, "docs/DIAGNOSTICS.md")
const COVERAGE_FILE = path.join(ROOT, "docs/COVERAGE.md")
const PACKAGE_NAME: string = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")).name
const CHECK_FLAG = "--check"
const REQUIRE_DOCS_FLAG = "--require-docs"

function renderDiagnostics(files: readonly TFileDoc[]): string {
	const all: TDiagnostic[] = files.flatMap((file) => file.diagnostics)
	const errors = all.filter((diagnostic) => diagnostic.severity === "error")
	const warnings = all.filter((diagnostic) => diagnostic.severity === "warning")
	const lines = ["# Diagnósticos", "", "_Gerado por `src/.scripts/doc/generate.ts`._", "", `${errors.length} erro(s), ${warnings.length} aviso(s).`, ""]
	for (const [title, list] of [["Erros", errors], ["Avisos", warnings]] as const) {
		lines.push(`## ${title}`, "")
		if (list.length === 0) lines.push("_Nenhum._")
		for (const diagnostic of list) lines.push(`- \`${diagnostic.file}:${diagnostic.line}\` **${diagnostic.rule}** — ${diagnostic.message}`)
		lines.push("")
	}
	return lines.join("\n")
}

function renderCoverage(coverage: readonly TCoverageItem[]): string {
	const missing = coverage.filter((item) => !item.documented)
	const lines = [
		"# Cobertura da documentação",
		"",
		"_Gerado por `src/.scripts/doc/generate.ts`._ Conta cada símbolo público e cada membro público; `parts.x()` herda o JSDoc de `parts`.",
		"",
		`**${coverage.length - missing.length}/${coverage.length}** documentados (${ApiRender.percent(coverage.length - missing.length, coverage.length)}).`,
		"",
	]
	if (missing.length === 0) return lines.concat("Tudo documentado.", "").join("\n")
	lines.push("## Sem documentação", "")
	let currentModule = ""
	for (const item of missing) {
		if (item.module !== currentModule) lines.push("", `### \`${item.module}\``, "")
		currentModule = item.module
		lines.push(`- \`${item.name}\` — \`${item.file}:${item.line}\``)
	}
	return lines.join("\n") + "\n"
}

function writeApiPages(files: readonly TFileDoc[]): { written: number; coverage: TCoverageItem[] } {
	const modules = ApiModel.modules(files)
	const coverage = ApiModel.coverage(modules)
	const globals = files.flatMap((file) => file.globals.map((augmentation) => ({ file, augmentation })))
	const pages = new Map<string, string>()
	pages.set("README.md", ApiRender.indexPage(PACKAGE_NAME, modules, coverage, globals.length > 0))
	if (globals.length > 0) pages.set("globals.md", ApiRender.globalsPage(globals))
	const docsDirectory = path.relative(ROOT, API_DIRECTORY)
	const symbols = ApiRender.symbolPages(modules, docsDirectory)
	for (const module of modules) pages.set(ApiRender.pagePath(module.name), ApiRender.modulePage(module, docsDirectory, symbols))
	let written = 0
	for (const [page, content] of pages) {
		const target = path.join(API_DIRECTORY, page)
		fs.mkdirSync(path.dirname(target), { recursive: true })
		if (writeIfChanged(target, content)) written++
	}
	removeStalePages(API_DIRECTORY, new Set([...pages.keys()].map((page) => path.join(API_DIRECTORY, page))))
	return { written, coverage }
}

function removeStalePages(directory: string, keep: ReadonlySet<string>): void {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const target = path.join(directory, entry.name)
		if (entry.isDirectory()) {
			removeStalePages(target, keep)
			if (fs.readdirSync(target).length === 0) fs.rmdirSync(target)
		} else if (entry.name.endsWith(".md") && !keep.has(target)) {
			fs.unlinkSync(target)
		}
	}
}

function main(): void {
	const files = walkSourceFiles(SOURCE_DIRECTORY).map((absolute) => extractFile(absolute, toPosixPath(path.relative(ROOT, absolute))))
	const indexChanged = writeIfChanged(path.join(ROOT, ENTRY), buildIndex(files, toPosixPath(path.dirname(ENTRY)), ENTRY))
	const diagnosticsChanged = writeIfChanged(DIAGNOSTICS_FILE, renderDiagnostics(files))
	fs.mkdirSync(API_DIRECTORY, { recursive: true })
	const { written, coverage } = writeApiPages(files)
	const coverageChanged = writeIfChanged(COVERAGE_FILE, renderCoverage(coverage))
	const errors = files.flatMap((file) => file.diagnostics).filter((diagnostic) => diagnostic.severity === "error")
	const documented = coverage.filter((item) => item.documented).length

	console.log(`src/index.ts        ${indexChanged ? "wrote" : "unchanged"}`)
	console.log(`docs/api/           ${written} página(s) escrita(s)`)
	console.log(`docs/COVERAGE.md    ${coverageChanged ? "wrote" : "unchanged"} — ${documented}/${coverage.length} documentados`)
	console.log(`docs/DIAGNOSTICS.md ${diagnosticsChanged ? "wrote" : "unchanged"} — ${errors.length} erro(s)`)
	if (process.argv.includes(CHECK_FLAG) && errors.length > 0) {
		for (const error of errors) console.error(`${error.file}:${error.line} ${error.rule} — ${error.message}`)
		process.exit(1)
	}
	const undocumented = coverage.filter((item) => !item.documented)
	if (process.argv.includes(REQUIRE_DOCS_FLAG) && undocumented.length > 0) {
		for (const item of undocumented) console.error(`${item.file}:${item.line} sem JSDoc — ${item.name}`)
		process.exit(1)
	}
}

main()
