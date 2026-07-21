import fs from "fs";
import path from "path";
import { AnalyzerProject } from "../analyzer/model";
import { ProjectBlockCode, JSDocTag } from "../analyzer/block/types";
import { logger } from "../logger";
import { isTestFile } from "./index-generator";

export interface TGenerateDocsOptions {
	entry?: string;
	projectOutput?: string;
	apiOutput?: string;
	modulesDir?: string;
}

interface TCollectedBlock {
	block: ProjectBlockCode;
	isPublic: boolean;
}

interface TModuleGroup {
	/** Directory path relative to the package root, e.g. `src/mask` (`src` itself for root-level files). */
	dirPath: string;
	/** Filename-safe identifier derived from `dirPath` (e.g. `natives-object-proxy`, or `root`). */
	slug: string;
	entries: TCollectedBlock[];
}

function classify(block: ProjectBlockCode): string {
	return block.isTypeOnly ? `${block.category}, type-only` : block.category;
}

function moduleSlug(dirPath: string): string {
	const withoutSrc = dirPath.replace(/^src\/?/, "");
	return withoutSrc === "" ? "root" : withoutSrc.replace(/\//g, "-");
}

function displayModulePath(dirPath: string): string {
	const withoutSrc = dirPath.replace(/^src\/?/, "");
	return withoutSrc === "" ? "(root)" : withoutSrc;
}

/** A GitHub-style `path#L<line>` link, relative to a doc file `depth` directories below the package root. */
function sourceLink(relativeSourcePath: string, startLine: number, depth: number): string {
	const prefix = "../".repeat(depth);
	return `${prefix}${relativeSourcePath}#L${startLine}`;
}

function formatTags(tags: JSDocTag[]): string {
	return tags.map((t) => `- \`@${t.name}\`${t.value ? ` ${t.value}` : ""}`).join("\n");
}

function collectModules(project: AnalyzerProject, entry: string): Map<string, TModuleGroup> {
	const modules = new Map<string, TModuleGroup>();

	project.files.forEach((file) => {
		if (file.relativePath === entry) return;
		if (isTestFile(file)) return;
		if (!file.blocks.length) return;

		const dirPath = path.dirname(file.relativePath).replace(/\\/g, "/");
		const slug = moduleSlug(dirPath);

		let group = modules.get(slug);
		if (!group) {
			group = { dirPath, slug, entries: [] };
			modules.set(slug, group);
		}

		file.blocks.forEach((block) => {
			const isPublic = !block.isInternal() && file.exports.some((exp) => exp.blockCode === block);
			group!.entries.push({ block, isPublic });
		});
	});

	return modules;
}

function sortedModules(modules: Map<string, TModuleGroup>): TModuleGroup[] {
	return [...modules.values()].sort((a, b) => a.dirPath.localeCompare(b.dirPath));
}

/** One page per module (source directory) — every declaration in it, linked to its exact source line, no source code repeated here. */
function renderModulePage(group: TModuleGroup): string {
	const lines: string[] = [
		"[← Voltar para PROJECT.md](../PROJECT.md)",
		"",
		`# ${displayModulePath(group.dirPath)}`,
		"",
	];

	group.entries.forEach(({ block }) => {
		const link = sourceLink(block.location.file, block.location.startLine, 2);
		lines.push(`<a id="${block.name}"></a>`);
		lines.push(`#### [\`${block.name}\`](${link}) _(${classify(block)})_`);
		lines.push("");

		if (block.documentation?.description.trim()) {
			lines.push(block.documentation.description.trim());
			lines.push("");
		}

		if (block.documentation?.tags.length) {
			lines.push(formatTags(block.documentation.tags));
			lines.push("");
		}
	});

	return lines.join("\n");
}

/** Root index — every resource in the project (exported or not), redirecting to its module page for details. No source code here either. */
function renderProjectIndex(modules: TModuleGroup[]): string {
	const lines: string[] = [
		"# Project documentation",
		"",
		"Gerado por `scripts/tools/docs-generator.ts`. Lista todos os recursos do projeto, exportados ou não — cada nome aponta pro arquivo do módulo correspondente (`modules/`), que tem descrição e tags; o código real fica só no arquivo-fonte (o próprio módulo já linka pra lá).",
		"",
	];

	modules.forEach((group) => {
		lines.push(`### ${displayModulePath(group.dirPath)}`);
		lines.push("");
		group.entries.forEach(({ block }) => {
			lines.push(`- [\`${block.name}\`](modules/${group.slug}.md#${block.name}) _(${classify(block)})_`);
		});
		lines.push("");
	});

	return lines.join("\n");
}

/** The file meant to travel with the published package — just the public declaration names and their kind, nothing else. */
function renderApiDoc(modules: TModuleGroup[], repoUrl?: string): string {
	const lines: string[] = [
		"# Public API",
		"",
		"Lista das declarações públicas de `@lotexiu/typescript` — só os nomes e o tipo de cada uma.",
		"",
	];

	modules.forEach((group) => {
		const publicEntries = group.entries.filter((e) => e.isPublic);
		if (publicEntries.length === 0) return;

		lines.push(`### ${displayModulePath(group.dirPath)}`);
		lines.push("");
		publicEntries.forEach(({ block }) => {
			lines.push(`- \`${block.name}\` _(${classify(block)})_`);
		});
		lines.push("");
	});

	lines.push("---", "");
	lines.push(
		repoUrl
			? `Para descrição, exemplos e código-fonte, veja o repositório: ${repoUrl}`
			: "Para descrição, exemplos e código-fonte, veja o repositório do projeto.",
	);

	return lines.join("\n");
}

export function generateDocs(project: AnalyzerProject, options: TGenerateDocsOptions = {}) {
	const entry = options.entry ?? "src/index.ts";
	const projectOutput = options.projectOutput ?? "docs/PROJECT.md";
	const apiOutput = options.apiOutput ?? "docs/API.md";
	const modulesDir = options.modulesDir ?? "docs/modules";

	const modulesAbsDir = path.join(project.dir, modulesDir);
	fs.rmSync(modulesAbsDir, { recursive: true, force: true });

	const modules = sortedModules(collectModules(project, entry));

	modules.forEach((group) => {
		project.writeFile(path.join(modulesDir, `${group.slug}.md`), renderModulePage(group));
	});

	project.writeFile(projectOutput, renderProjectIndex(modules));
	project.writeFile(apiOutput, renderApiDoc(modules, project.packageJson?.repository?.url));

	logger.success(`Docs generated: ${projectOutput}, ${apiOutput}, ${modules.length} module page(s) in ${modulesDir}/`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const project = new AnalyzerProject(process.cwd());
	generateDocs(project);
}
