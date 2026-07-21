import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";
import { afterEach, describe, expect, it } from "vitest";
import { AnalyzerProject } from "../analyzer/model";
import { computeApiChanges, runCheck, runGenerate } from "./generate-changes";

/**
 * Unlike generate-changes.test.ts (which mocks git + AnalyzerProject to test the
 * orchestration logic in isolation), this exercises the real `git worktree`-based
 * merge-base snapshot mechanism end-to-end against a real, throwaway git repo — the
 * same thing generate-changes.test.ts's mocks stand in for.
 */

const tmpDirs: string[] = [];

afterEach(() => {
	while (tmpDirs.length) {
		const dir = tmpDirs.pop();
		if (dir) fs.rmSync(dir, { recursive: true, force: true });
	}
});

function run(cmd: string, cwd: string): string {
	return execSync(cmd, { cwd, encoding: "utf-8" }).trim();
}

function makeTmpDir(prefix: string): string {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
	tmpDirs.push(dir);
	return dir;
}

function writeProject(dir: string, source: string) {
	fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "@fixture/pkg", version: "1.0.0" }));
	fs.writeFileSync(
		path.join(dir, "tsconfig.json"),
		JSON.stringify({ compilerOptions: { target: "ES2020", module: "ESNext", moduleResolution: "Bundler" }, include: ["src/**/*"] }),
	);
	fs.mkdirSync(path.join(dir, "src"), { recursive: true });
	fs.writeFileSync(path.join(dir, "src", "utils.ts"), source);
}

/** origin repo with one commit on master, cloned into a work repo with one extra commit on `feature`. */
function setupOriginAndClone(featureSource: string): { workDir: string } {
	const originDir = makeTmpDir("generate-changes-origin-");
	run("git init -q", originDir);
	run('git config user.email "test@example.com"', originDir);
	run('git config user.name "Test"', originDir);
	writeProject(originDir, `export function existing(): void {}\n`);
	run("git add -A", originDir);
	run('git commit -q -m "initial"', originDir);
	run("git branch -M master", originDir);

	const workDir = makeTmpDir("generate-changes-work-");
	run(`git clone -q "${originDir}" "${workDir}"`, os.tmpdir());
	run("git checkout -q -b feature", workDir);
	writeProject(workDir, featureSource);
	run("git add -A", workDir);
	run('git commit -q -m "feature change"', workDir);

	return { workDir };
}

describe("computeApiChanges (real git worktree)", () => {
	it("detects an added export relative to the real merge-base with origin/master", () => {
		const { workDir } = setupOriginAndClone(`export function existing(): void {}\nexport function addedThing(): void {}\n`);

		const project = new AnalyzerProject(workDir);
		const changes = computeApiChanges(project, workDir);

		expect(changes.added.map((e) => e.name)).toEqual(["addedThing"]);
		expect(changes.removed).toEqual([]);
		expect(changes.tags).toEqual(expect.arrayContaining(["minor", "feat"]));
	});

	it("tags docs when only a non-src file changed", () => {
		const originDir = makeTmpDir("generate-changes-origin-");
		run("git init -q", originDir);
		run('git config user.email "test@example.com"', originDir);
		run('git config user.name "Test"', originDir);
		writeProject(originDir, `export function existing(): void {}\n`);
		run("git add -A", originDir);
		run('git commit -q -m "initial"', originDir);
		run("git branch -M master", originDir);

		const workDir = makeTmpDir("generate-changes-work-");
		run(`git clone -q "${originDir}" "${workDir}"`, os.tmpdir());
		run("git checkout -q -b feature", workDir);
		fs.writeFileSync(path.join(workDir, "README.md"), "# updated docs\n");
		run("git add -A", workDir);
		run('git commit -q -m "docs only"', workDir);

		const changes = computeApiChanges(new AnalyzerProject(workDir), workDir);

		expect(changes.added).toEqual([]);
		expect(changes.tags).toEqual(["patch", "docs"]);
	});

	it("tags docs (not refact) when a JSDoc comment is added inside src/** to an already-public function", () => {
		const originDir = makeTmpDir("generate-changes-origin-");
		run("git init -q", originDir);
		run('git config user.email "test@example.com"', originDir);
		run('git config user.name "Test"', originDir);
		writeProject(originDir, `export function helper(): number { return 1; }\n`);
		run("git add -A", originDir);
		run('git commit -q -m "initial"', originDir);
		run("git branch -M master", originDir);

		const workDir = makeTmpDir("generate-changes-work-");
		run(`git clone -q "${originDir}" "${workDir}"`, os.tmpdir());
		run("git checkout -q -b feature", workDir);
		writeProject(workDir, `/** Does a thing. */\nexport function helper(): number { return 1; }\n`);
		run("git add -A", workDir);
		run('git commit -q -m "document helper"', workDir);

		const changes = computeApiChanges(new AnalyzerProject(workDir), workDir);

		expect(changes.added).toEqual([]);
		expect(changes.changed).toEqual([]);
		expect(changes.tags).toEqual(["patch", "docs"]);
	});

	it("tags both refact and fix for a small same-signature code change to a public export", () => {
		const originDir = makeTmpDir("generate-changes-origin-");
		run("git init -q", originDir);
		run('git config user.email "test@example.com"', originDir);
		run('git config user.name "Test"', originDir);
		writeProject(originDir, `export function helper(): number { return 1; }\n`);
		run("git add -A", originDir);
		run('git commit -q -m "initial"', originDir);
		run("git branch -M master", originDir);

		const workDir = makeTmpDir("generate-changes-work-");
		run(`git clone -q "${originDir}" "${workDir}"`, os.tmpdir());
		run("git checkout -q -b feature", workDir);
		writeProject(workDir, `export function helper(): number { return 2; }\n`);
		run("git add -A", workDir);
		run('git commit -q -m "fix off-by-one"', workDir);

		const changes = computeApiChanges(new AnalyzerProject(workDir), workDir);

		expect(changes.changed).toEqual([]);
		expect(changes.tags).toEqual(expect.arrayContaining(["refact", "fix"]));
	});

	it("tags internal when only an @internal-tagged block changed", () => {
		const originDir = makeTmpDir("generate-changes-origin-");
		run("git init -q", originDir);
		run('git config user.email "test@example.com"', originDir);
		run('git config user.name "Test"', originDir);
		fs.writeFileSync(path.join(originDir, "package.json"), JSON.stringify({ name: "@fixture/pkg", version: "1.0.0" }));
		fs.writeFileSync(
			path.join(originDir, "tsconfig.json"),
			JSON.stringify({ compilerOptions: { target: "ES2020", module: "ESNext", moduleResolution: "Bundler" }, include: ["src/**/*"] }),
		);
		fs.mkdirSync(path.join(originDir, "src"), { recursive: true });
		fs.writeFileSync(
			path.join(originDir, "src", "utils.ts"),
			`/** @internal */\nexport class _Foo {\n\tstatic helper(): number { return 1; }\n}\n`,
		);
		run("git add -A", originDir);
		run('git commit -q -m "initial"', originDir);
		run("git branch -M master", originDir);

		const workDir = makeTmpDir("generate-changes-work-");
		run(`git clone -q "${originDir}" "${workDir}"`, os.tmpdir());
		run("git checkout -q -b feature", workDir);
		fs.writeFileSync(
			path.join(workDir, "src", "utils.ts"),
			`/** @internal */\nexport class _Foo {\n\tstatic helper(): number { return 2; }\n}\n`,
		);
		run("git add -A", workDir);
		run('git commit -q -m "internal tweak"', workDir);

		const changes = computeApiChanges(new AnalyzerProject(workDir), workDir);

		expect(changes.added).toEqual([]);
		expect(changes.changed).toEqual([]);
		// the internal tweak is a 1-line change, small enough that `fix` also applies (see
		// the "tags both refact and fix" test above for the same rule on a public export)
		expect(changes.tags).toEqual(expect.arrayContaining(["patch", "internal", "fix"]));
	});

	it("does not disturb the current checkout while snapshotting the base branch", () => {
		const { workDir } = setupOriginAndClone(`export function existing(): void {}\nexport function addedThing(): void {}\n`);

		const project = new AnalyzerProject(workDir);
		computeApiChanges(project, workDir);

		expect(fs.readFileSync(path.join(workDir, "src", "utils.ts"), "utf-8")).toContain("addedThing");
		expect(run("git branch --show-current", workDir)).toBe("feature");
	});
});

describe("runGenerate + runCheck (real git worktree)", () => {
	it("writes a changes file that runCheck then verifies as reproducible", () => {
		const { workDir } = setupOriginAndClone(`export function existing(): void {}\nexport function addedThing(): void {}\n`);
		const project = new AnalyzerProject(workDir);

		runGenerate(project, workDir);
		expect(runCheck(project, workDir)).toBe(true);
	});

	it("fails runCheck once more source changes land without regenerating", () => {
		const { workDir } = setupOriginAndClone(`export function existing(): void {}\nexport function addedThing(): void {}\n`);
		const project = new AnalyzerProject(workDir);

		runGenerate(project, workDir);

		fs.appendFileSync(path.join(workDir, "src", "utils.ts"), `export function anotherThing(): void {}\n`);
		run("git add -A", workDir);
		run('git commit -q -m "more changes, forgot to regenerate"', workDir);

		expect(runCheck(new AnalyzerProject(workDir), workDir)).toBe(false);
	});
});
