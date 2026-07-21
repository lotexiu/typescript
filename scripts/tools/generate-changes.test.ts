import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AnalyzerProject } from "../analyzer/model";
import type { TApiSnapshot } from "./api-snapshot";

vi.mock("./api-snapshot", () => ({
	buildApiSnapshot: vi.fn(),
}));

// `withRefSnapshot` (inlined in generate-changes.ts) shells out via `execSync` for
// `git fetch`/`git merge-base`/`git worktree add|remove`, and constructs a real
// `AnalyzerProject` over the worktree it creates. Neither needs to be real for these
// unit tests — `buildApiSnapshot` above is what actually stands in for "the base
// snapshot" — so both are stubbed out; `generate-changes.integration.test.ts` covers
// the real git-worktree mechanics end-to-end instead.
vi.mock("child_process", () => ({
	execSync: vi.fn((cmd: string) => {
		if (cmd.includes("rev-parse HEAD")) return "head-sha\n";
		if (cmd.includes("merge-base")) return "base-sha\n";
		return "";
	}),
}));

vi.mock("../analyzer/model", () => ({
	AnalyzerProject: vi.fn().mockImplementation(function FakeAnalyzerProject() {
		return {};
	}),
}));

import { buildApiSnapshot } from "./api-snapshot";
import { computeApiChanges, formatChangelogMd, runCheck, runGenerate, TApiChangesFile } from "./generate-changes";

const buildApiSnapshotMock = vi.mocked(buildApiSnapshot);

function makeProject(overrides: Partial<{ name: string; version: string }> = {}, writeFile = vi.fn()): AnalyzerProject {
	return {
		packageJson: { name: overrides.name ?? "@lotexiu/typescript", version: overrides.version ?? "2.0.0" },
		writeFile,
	} as unknown as AnalyzerProject;
}

function emptySnapshot(): TApiSnapshot {
	return { exports: [] };
}

describe("computeApiChanges", () => {
	beforeEach(() => {
		buildApiSnapshotMock.mockReset();
	});

	it("wires snapshot + diff + tag classification together", () => {
		buildApiSnapshotMock
			.mockReturnValueOnce({ exports: [{ name: "foo", category: "function", isTypeOnly: false, file: "src/foo.ts", signature: "(): void" }] }) // head
			.mockReturnValueOnce(emptySnapshot()); // base

		const changes = computeApiChanges(makeProject(), "/fake/repo");

		expect(changes.tags).toEqual(expect.arrayContaining(["minor", "feat"]));
		expect(changes.added.map((e) => e.name)).toEqual(["foo"]);
		expect(changes.baseRef).toBe("base-sha");
		expect(changes.headRef).toBe("head-sha");
	});

	it("tags patch + docs when nothing changed and no src file was touched (git diff mocked empty)", () => {
		buildApiSnapshotMock.mockReturnValueOnce(emptySnapshot()).mockReturnValueOnce(emptySnapshot());
		const changes = computeApiChanges(makeProject(), "/fake/repo");
		expect(changes.tags).toEqual(["patch", "docs"]);
	});
});

function makeChanges(overrides: Partial<TApiChangesFile> = {}): TApiChangesFile {
	return {
		schemaVersion: 1,
		package: "@lotexiu/typescript",
		baseRef: "a",
		headRef: "b",
		generatedAt: "2026-01-01T00:00:00.000Z",
		tags: ["minor", "feat"],
		added: [],
		removed: [],
		changed: [],
		...overrides,
	};
}

describe("formatChangelogMd", () => {
	it("renders added/removed/changed sections with ready-made phrasing, only for sections that have entries", () => {
		const changes = makeChanges({ added: [{ name: "foo", category: "function", file: "src/foo.ts" }] });

		const md = formatChangelogMd(changes);

		expect(md).toContain("## Added");
		expect(md).toContain("Adicionado `foo` _(function)_ — src/foo.ts");
		expect(md).not.toContain("## Removed");
		expect(md).not.toContain("## Changed");
	});

	it("describes changed entries as fixes", () => {
		const changes = makeChanges({
			tags: ["major", "fix"],
			changed: [{ name: "bar", category: "function", file: "src/bar.ts", previousSignature: "a", nextSignature: "b" }],
		});

		expect(formatChangelogMd(changes)).toContain("Corrigido `bar` _(function)_ — src/bar.ts");
	});

	it("prints an explanatory line instead of empty sections when nothing structurally changed", () => {
		const docsOnly = formatChangelogMd(makeChanges({ tags: ["patch", "docs"] }));
		expect(docsOnly).not.toContain("## Added");
		expect(docsOnly).toContain("Documentação/comentários atualizados");

		const internalOnly = formatChangelogMd(makeChanges({ tags: ["patch", "internal"] }));
		expect(internalOnly).toContain("sem impacto na API pública");
	});

	it("lists every applicable note when docs and refact both apply (mixed touched files)", () => {
		const mixed = formatChangelogMd(makeChanges({ tags: ["patch", "docs", "refact"] }));
		expect(mixed).toContain("Documentação/comentários atualizados");
		expect(mixed).toContain("Refatoração interna");
	});
});

describe("runCheck", () => {
	const tmpDirs: string[] = [];

	afterEach(() => {
		while (tmpDirs.length) {
			const dir = tmpDirs.pop();
			if (dir) fs.rmSync(dir, { recursive: true, force: true });
		}
	});

	function makeRepoDir(): string {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), "generate-changes-check-"));
		tmpDirs.push(dir);
		return dir;
	}

	beforeEach(() => {
		buildApiSnapshotMock.mockReset();
	});

	it("fails when .changes/api-changes.json is missing", () => {
		const repoDir = makeRepoDir();
		buildApiSnapshotMock.mockReturnValue(emptySnapshot());
		expect(runCheck(makeProject(), repoDir)).toBe(false);
	});

	it("passes when the committed file matches a fresh recompute", () => {
		const repoDir = makeRepoDir();
		buildApiSnapshotMock.mockReturnValue(emptySnapshot());

		const committed: TApiChangesFile = computeApiChanges(makeProject(), repoDir);
		fs.mkdirSync(path.join(repoDir, ".changes"), { recursive: true });
		fs.writeFileSync(path.join(repoDir, ".changes", "api-changes.json"), JSON.stringify(committed));

		buildApiSnapshotMock.mockReset();
		buildApiSnapshotMock.mockReturnValue(emptySnapshot());

		expect(runCheck(makeProject(), repoDir)).toBe(true);
	});

	it("fails when tags were hand-edited after generation, even if headRef still matches", () => {
		const repoDir = makeRepoDir();
		buildApiSnapshotMock.mockReturnValue(emptySnapshot());

		const committed: TApiChangesFile = computeApiChanges(makeProject(), repoDir);
		const tampered = { ...committed, tags: ["patch"] };
		fs.mkdirSync(path.join(repoDir, ".changes"), { recursive: true });
		fs.writeFileSync(path.join(repoDir, ".changes", "api-changes.json"), JSON.stringify(tampered));

		buildApiSnapshotMock.mockReset();
		buildApiSnapshotMock.mockReturnValue(emptySnapshot());

		expect(runCheck(makeProject(), repoDir)).toBe(false);
	});
});

describe("runGenerate", () => {
	beforeEach(() => {
		buildApiSnapshotMock.mockReset();
		buildApiSnapshotMock.mockReturnValue(emptySnapshot());
	});

	it("writes both .changes files via project.writeFile", () => {
		const writeFile = vi.fn();
		const project = makeProject({}, writeFile);

		runGenerate(project, "/fake/repo");

		const writtenPaths = writeFile.mock.calls.map((call) => call[0]);
		expect(writtenPaths).toContain(path.join(".changes", "api-changes.json"));
		expect(writtenPaths).toContain(path.join(".changes", "CHANGELOG.md"));
	});
});
