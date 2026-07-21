import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";
import ts from "typescript";
import { AnalyzerProject } from "../analyzer/model";
import { logger } from "../logger";
import { buildApiSnapshot } from "./api-snapshot";
import { diffApiSnapshots, detectImpact, TApiDiff } from "./api-diff";

export interface TApiChangesFile {
	schemaVersion: 1;
	package: string;
	baseRef: string;
	headRef: string;
	generatedAt: string;
	tags: string[];
	added: TApiDiff["added"];
	removed: TApiDiff["removed"];
	changed: TApiDiff["changed"];
}

function run(cmd: string, cwd: string): string {
	return execSync(cmd, { cwd, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function currentHeadSha(repoDir: string): string {
	return run("git rev-parse HEAD", repoDir);
}

/** The merge-base between HEAD and the base branch, from the checkout's own git history. */
function resolveMergeBaseRef(repoDir: string, baseBranch: string): string {
	run(`git fetch --quiet origin ${baseBranch}`, repoDir);
	return run(`git merge-base origin/${baseBranch} HEAD`, repoDir);
}

/**
 * Materializes `ref` into a throwaway `git worktree` — not a `git checkout` over the
 * current working directory — so a snapshot of another branch never disturbs whatever
 * is currently checked out, committed or not: a crash mid-way just leaves an orphaned
 * temp folder, never a working tree stranded on the wrong branch with a dangling stash.
 */
function withRefSnapshot<T>(repoDir: string, ref: string, fn: (project: AnalyzerProject) => T): T {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "api-snapshot-"));
	fs.rmdirSync(tmpDir);
	try {
		run(`git worktree add --detach "${tmpDir}" ${ref}`, repoDir);
		return fn(new AnalyzerProject(tmpDir));
	} finally {
		try {
			run(`git worktree remove --force "${tmpDir}"`, repoDir);
		} catch {
			// best-effort — the rmSync fallback below still cleans up the directory either way
		}
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
}

/** Files under `src/**` that differ textually between `baseRef` and HEAD — the raw
 * signal used to tell "nothing in the library's source changed" (docs) apart from
 * "source changed but no public export was affected" (internal/refact). */
function touchedSrcFiles(repoDir: string, baseRef: string): string[] {
	const output = run(`git diff --name-only ${baseRef} HEAD -- src`, repoDir);
	return output
		.split("\n")
		.map((file) => file.trim().replace(/\\/g, "/"))
		.filter(Boolean);
}

const commentFreePrinter = ts.createPrinter({ removeComments: true });

/**
 * A touched file's code with every comment (including JSDoc) stripped, reprinted through
 * the TS printer. Reprinting (rather than a regex-based comment strip) is immune to
 * comment-like text inside strings/regexes/templates, and as a side effect also
 * normalizes formatting — so a pure whitespace/reindentation edit reads as "no real
 * change" too, the same as a pure comment edit. Returns `undefined` when the file didn't
 * exist on that side (added/deleted) — never treated as equal to any real content.
 */
function commentFreeText(project: AnalyzerProject, file: string): string | undefined {
	const projectFile = project.getFile(file);
	if (!projectFile) return undefined;
	return commentFreePrinter.printFile(projectFile.getSourceFile());
}

/** Total added+removed lines a file has between `baseRef` and HEAD, from `git diff --numstat`. */
function changedLineCount(repoDir: string, baseRef: string, file: string): number {
	const output = run(`git diff --numstat ${baseRef} HEAD -- "${file}"`, repoDir);
	const [added, removed] = output.split("\t");
	return (Number(added) || 0) + (Number(removed) || 0);
}

/**
 * A small enough real code diff is genuinely ambiguous between "fix" and "refact"/
 * "internal" without reading semantics/behavior — cheaper and more honest to tag it as
 * both than to guess wrong. Larger diffs are less likely to be "just a quick fix", so
 * they keep only the refact/internal tag. Deliberately a small, adjustable number, not a
 * tuned constant — this is the "basic" version, not a precise classifier.
 */
const SMALL_CHANGE_LINE_THRESHOLD = 5;

/**
 * Type tags, derived from the same diff — no keyword-guessing on commit messages, no
 * line-count heuristics for `feat`/`fix` themselves.
 * - `feat`/`fix` come directly from the export-level diff (added/changed).
 * - `docs` applies to any touched file whose code is byte-identical once comments are
 *   stripped — regardless of whether it lives in `src/**` or elsewhere, so a JSDoc-only
 *   edit to a public function counts as `docs`, not `refact`.
 * - `internal`/`refact` apply to files with an actual code difference: `internal` when
 *   that file exposes no non-`@internal` export, `refact` otherwise; if the total size of
 *   that real diff is small (see `SMALL_CHANGE_LINE_THRESHOLD`), `fix` is added alongside
 *   it too, since a same-signature change that small is as likely to be a bugfix as a
 *   refactor and telling them apart would need real semantic analysis.
 * - `clean-code` is deliberately never auto-applied — telling "purely cosmetic" apart
 *   from "a real internal change" beyond comments/whitespace needs far more than a
 *   "basic" check, so it stays a manual, human-added tag.
 * A single PR can touch both kinds of files at once, so more than one of these can apply
 * together (e.g. `docs` for a comment fix alongside `refact` for a real one).
 */
function classifyTypeTags(
	diff: TApiDiff,
	srcFiles: string[],
	baseProject: AnalyzerProject,
	headProject: AnalyzerProject,
	repoDir: string,
	baseRef: string,
): string[] {
	const tags = new Set<string>();

	if (diff.added.length > 0) tags.add("feat");
	if (diff.changed.length > 0) tags.add("fix");

	if (srcFiles.length === 0) {
		if (diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0) tags.add("docs");
		return Array.from(tags);
	}

	const noOpFiles = srcFiles.filter((file) => commentFreeText(baseProject, file) === commentFreeText(headProject, file));
	const realChangeFiles = srcFiles.filter((file) => !noOpFiles.includes(file));

	if (noOpFiles.length > 0) tags.add("docs");

	if (realChangeFiles.length > 0) {
		const allInternal = realChangeFiles.every((file) => {
			const projectFile = headProject.getFile(file);
			// A deleted file with a public export would already show up as `removed` above.
			if (!projectFile) return true;
			return projectFile.exports.every((exp) => exp.blockCode.isInternal());
		});
		tags.add(allInternal ? "internal" : "refact");

		const totalChangedLines = realChangeFiles.reduce((sum, file) => sum + changedLineCount(repoDir, baseRef, file), 0);
		if (totalChangedLines <= SMALL_CHANGE_LINE_THRESHOLD) tags.add("fix");
	}

	return Array.from(tags);
}

export function computeApiChanges(project: AnalyzerProject, repoDir: string, baseBranch = "master"): TApiChangesFile {
	const baseRef = resolveMergeBaseRef(repoDir, baseBranch);
	const headSnapshot = buildApiSnapshot(project);
	const srcFiles = touchedSrcFiles(repoDir, baseRef);

	// Safe to use baseProject after the worktree directory is removed below: its
	// `ts.Program` already parsed every file into memory at construction time (that's
	// how `ts.createProgram` works), so `getSourceFile()`/`getText()` never touch disk
	// again — no need to extract comment-free text before the `finally` block runs.
	const { baseSnapshot, baseProjectForCompare } = withRefSnapshot(repoDir, baseRef, (baseProject) => ({
		baseSnapshot: buildApiSnapshot(baseProject),
		baseProjectForCompare: baseProject,
	}));

	const diff = diffApiSnapshots(baseSnapshot, headSnapshot);
	const impact = detectImpact(diff);
	const typeTags = classifyTypeTags(diff, srcFiles, baseProjectForCompare, project, repoDir, baseRef);

	return {
		schemaVersion: 1,
		package: project.packageJson?.name || "unknown",
		baseRef,
		headRef: currentHeadSha(repoDir),
		generatedAt: new Date().toISOString(),
		tags: [impact, ...typeTags],
		added: diff.added,
		removed: diff.removed,
		changed: diff.changed,
	};
}

const NO_OP_MESSAGE_BY_TAG: Record<string, string> = {
	docs: "Documentação/comentários atualizados (dentro ou fora de `src/`).",
	internal: "Alterações internas (implementação de blocos `@internal`) — sem impacto na API pública.",
	refact: "Refatoração interna — a API pública permanece com a mesma assinatura.",
};

export function formatChangelogMd(changes: TApiChangesFile): string {
	const lines: string[] = [`# API changes`, "", `Tags: ${changes.tags.map((t) => `\`${t}\``).join(", ")}`, ""];

	const hasStructuralChange = changes.added.length > 0 || changes.removed.length > 0 || changes.changed.length > 0;

	if (!hasStructuralChange) {
		// More than one of docs/internal/refact can apply at once — e.g. some touched
		// files were comment-only while others had a real internal change — so every
		// matching note is listed, never just the first one found.
		const notes = changes.tags.map((tag) => NO_OP_MESSAGE_BY_TAG[tag]).filter(Boolean);
		if (notes.length === 0) notes.push("Nenhuma alteração na API pública.");
		notes.forEach((note) => lines.push(`- ${note}`));
		return lines.join("\n");
	}

	const section = (title: string, verb: string, entries: { name: string; category: string; file: string }[]) => {
		if (entries.length === 0) return;
		lines.push(`## ${title}`, "");
		entries.forEach((e) => lines.push(`- ${verb} \`${e.name}\` _(${e.category})_ — ${e.file}`));
		lines.push("");
	};

	section("Added", "Adicionado", changes.added);
	section("Removed", "Removido", changes.removed);
	section("Changed", "Corrigido", changes.changed);

	return lines.join("\n");
}

const FIELDS_TO_COMPARE: (keyof TApiChangesFile)[] = ["package", "tags", "added", "removed", "changed"];

/**
 * The real trust boundary: fields are always independently recomputed and compared,
 * never trusted at face value — this also catches someone hand-editing e.g. `impact`
 * after a genuine regeneration, which a bare "does headRef still match" check would miss.
 */
function mismatchedFields(committed: TApiChangesFile, fresh: TApiChangesFile): string[] {
	return FIELDS_TO_COMPARE.filter((field) => JSON.stringify(committed[field]) !== JSON.stringify(fresh[field]));
}

export function runCheck(project: AnalyzerProject, repoDir: string): boolean {
	const changesPath = path.join(repoDir, ".changes", "api-changes.json");
	if (!fs.existsSync(changesPath)) {
		logger.error("Missing .changes/api-changes.json — run `pnpm run changes` and commit the result.");
		return false;
	}
	const committed: TApiChangesFile = JSON.parse(fs.readFileSync(changesPath, "utf-8"));

	const actualHead = currentHeadSha(repoDir);
	if (committed.headRef !== actualHead) {
		logger.warn(
			`.changes/api-changes.json was generated for a different commit (${committed.headRef} vs current ${actualHead}) — likely stale.`,
		);
	}

	const fresh = computeApiChanges(project, repoDir);
	const mismatches = mismatchedFields(committed, fresh);

	if (mismatches.length > 0) {
		logger.error(`.changes/api-changes.json does not match a fresh recompute. Mismatched fields: ${mismatches.join(", ")}.`);
		logger.error("Run `pnpm run changes` and commit the result.");
		return false;
	}

	logger.success(".changes/api-changes.json matches a fresh recompute.");
	return true;
}

export function runGenerate(project: AnalyzerProject, repoDir: string, baseBranch?: string): TApiChangesFile {
	const changes = computeApiChanges(project, repoDir, baseBranch);
	project.writeFile(path.join(".changes", "api-changes.json"), `${JSON.stringify(changes, null, 2)}\n`);
	project.writeFile(path.join(".changes", "CHANGELOG.md"), formatChangelogMd(changes));
	logger.success(`Written .changes/api-changes.json and .changes/CHANGELOG.md (tags: ${changes.tags.join(", ")}).`);
	return changes;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const repoDir = process.cwd();
	const project = new AnalyzerProject(repoDir);
	const args = process.argv.slice(2);
	const baseIndex = args.indexOf("--base");
	const baseBranch = baseIndex >= 0 ? args[baseIndex + 1] : undefined;

	if (args.includes("--check")) {
		process.exit(runCheck(project, repoDir) ? 0 : 1);
	} else {
		runGenerate(project, repoDir, baseBranch);
	}
}
