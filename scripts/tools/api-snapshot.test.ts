import { describe, expect, it } from "vitest";
import { buildApiSnapshot } from "./api-snapshot";
import type { AnalyzerProject } from "../analyzer/model";
import type { ProjectBlockCode } from "../analyzer/block/types";

function makeBlock(overrides: Partial<ProjectBlockCode> = {}): ProjectBlockCode {
	return {
		name: "publicThing",
		category: "function",
		context: "local",
		isTypeOnly: false,
		exportStatus: "declaration-export",
		documentation: { description: "Public.", tags: [] },
		location: { file: "src/foo/utils.ts", start: 0, end: 0, startLine: 12, endLine: 12 },
		parentFile: { parentProject: { getProgram: () => undefined } } as any,
		importedBy: [],
		getText: () => "function publicThing(): void {}",
		getAstNode: () => undefined as any,
		isInternal(this: ProjectBlockCode) {
			return this.documentation?.tags.some((t) => t.name === "internal") ?? false;
		},
		...overrides,
	};
}

function makeProject(files: any[]): AnalyzerProject {
	return { dir: "/tmp/does-not-exist-api-snapshot-test", files } as unknown as AnalyzerProject;
}

describe("buildApiSnapshot", () => {
	it("includes a public export with its category and file", () => {
		const block = makeBlock();
		const files = [{ relativePath: "src/foo/utils.ts", exports: [{ name: "publicThing", isDefault: false, blockCode: block }] }];

		const snapshot = buildApiSnapshot(makeProject(files));

		expect(snapshot.exports).toEqual([
			expect.objectContaining({ name: "publicThing", category: "function", file: "src/foo/utils.ts" }),
		]);
	});

	it("excludes @internal-tagged exports", () => {
		const internalBlock = makeBlock({
			name: "_Internal",
			documentation: { description: "", tags: [{ name: "internal" }] },
		});
		const files = [{ relativePath: "src/foo/implementations.ts", exports: [{ name: "_Internal", isDefault: false, blockCode: internalBlock }] }];

		const snapshot = buildApiSnapshot(makeProject(files));

		expect(snapshot.exports).toEqual([]);
	});

	it("skips the entry file and test files", () => {
		const block = makeBlock();
		const files = [
			{ relativePath: "src/index.ts", exports: [{ name: "publicThing", isDefault: false, blockCode: block }] },
			{ relativePath: "src/foo/utils.test.ts", exports: [{ name: "publicThing", isDefault: false, blockCode: block }] },
		];

		const snapshot = buildApiSnapshot(makeProject(files), "src/index.ts");

		expect(snapshot.exports).toEqual([]);
	});

	it("sorts entries by name then file for deterministic diffing", () => {
		const bBlock = makeBlock({ name: "bThing", location: { file: "src/b/utils.ts", start: 0, end: 0, startLine: 1, endLine: 1 } });
		const aBlock = makeBlock({ name: "aThing", location: { file: "src/a/utils.ts", start: 0, end: 0, startLine: 1, endLine: 1 } });
		const files = [
			{ relativePath: "src/b/utils.ts", exports: [{ name: "bThing", isDefault: false, blockCode: bBlock }] },
			{ relativePath: "src/a/utils.ts", exports: [{ name: "aThing", isDefault: false, blockCode: aBlock }] },
		];

		const snapshot = buildApiSnapshot(makeProject(files));

		expect(snapshot.exports.map((e) => e.name)).toEqual(["aThing", "bThing"]);
	});
});
