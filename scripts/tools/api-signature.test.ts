import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { AnalyzerProject } from "../analyzer/model";
import { getSignatureText } from "./api-signature";

const tmpDirs: string[] = [];

afterEach(() => {
	while (tmpDirs.length) {
		const dir = tmpDirs.pop();
		if (dir) fs.rmSync(dir, { recursive: true, force: true });
	}
});

function buildProject(files: Record<string, string>): AnalyzerProject {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "api-signature-test-"));
	tmpDirs.push(dir);

	fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "fixture", version: "1.0.0" }));
	fs.writeFileSync(
		path.join(dir, "tsconfig.json"),
		JSON.stringify({
			compilerOptions: { target: "ES2020", module: "ESNext", moduleResolution: "Bundler", strict: true },
			include: ["src/**/*"],
		}),
	);

	Object.entries(files).forEach(([relativePath, content]) => {
		const fullPath = path.join(dir, relativePath);
		fs.mkdirSync(path.dirname(fullPath), { recursive: true });
		fs.writeFileSync(fullPath, content);
	});

	return new AnalyzerProject(dir);
}

function getBlock(project: AnalyzerProject, relativePath: string, name: string) {
	const file = project.getFile(relativePath);
	if (!file) throw new Error(`fixture file not found: ${relativePath}`);
	const exp = file.exports.find((e) => e.name === name);
	if (!exp) throw new Error(`export not found: ${name} in ${relativePath}`);
	return exp.blockCode;
}

describe("getSignatureText", () => {
	it("is stable across whitespace/comment-only changes to a function", () => {
		const projectA = buildProject({
			"src/utils.ts": `export function add(a: number, b: number): number { return a + b; }`,
		});
		const projectB = buildProject({
			"src/utils.ts": `
				// adds two numbers
				export function add(a: number, b: number): number {
					return a + b;
				}
			`,
		});

		const sigA = getSignatureText(getBlock(projectA, "src/utils.ts", "add"), projectA.dir);
		const sigB = getSignatureText(getBlock(projectB, "src/utils.ts", "add"), projectB.dir);

		expect(sigA).toBe(sigB);
	});

	it("changes when a parameter is added", () => {
		const before = buildProject({
			"src/utils.ts": `export function add(a: number, b: number): number { return a + b; }`,
		});
		const after = buildProject({
			"src/utils.ts": `export function add(a: number, b: number, c: number): number { return a + b + c; }`,
		});

		const sigBefore = getSignatureText(getBlock(before, "src/utils.ts", "add"), before.dir);
		const sigAfter = getSignatureText(getBlock(after, "src/utils.ts", "add"), after.dir);

		expect(sigBefore).not.toBe(sigAfter);
	});

	it("does not change when only the function body changes", () => {
		const before = buildProject({
			"src/utils.ts": `export function add(a: number, b: number): number { return a + b; }`,
		});
		const after = buildProject({
			"src/utils.ts": `export function add(a: number, b: number): number { const sum = a + b; return sum; }`,
		});

		const sigBefore = getSignatureText(getBlock(before, "src/utils.ts", "add"), before.dir);
		const sigAfter = getSignatureText(getBlock(after, "src/utils.ts", "add"), after.dir);

		expect(sigBefore).toBe(sigAfter);
	});

	it("resolves a local-reexport alias (const x = _Foo.method) through to the real method's signature", () => {
		const before = buildProject({
			"src/foo/implementations.ts": `
				/** @internal */
				export class _Foo {
					static isNull(value: unknown): boolean { return value === null; }
				}
			`,
			"src/foo/utils.ts": `
				import { _Foo } from './implementations';
				const isNull = _Foo.isNull;
				export { isNull };
			`,
		});
		const after = buildProject({
			"src/foo/implementations.ts": `
				/** @internal */
				export class _Foo {
					static isNull(value: unknown, strict: boolean): boolean { return strict ? value === null : value == null; }
				}
			`,
			"src/foo/utils.ts": `
				import { _Foo } from './implementations';
				const isNull = _Foo.isNull;
				export { isNull };
			`,
		});

		const sigBefore = getSignatureText(getBlock(before, "src/foo/utils.ts", "isNull"), before.dir);
		const sigAfter = getSignatureText(getBlock(after, "src/foo/utils.ts", "isNull"), after.dir);

		expect(sigBefore).not.toBe(sigAfter);
	});
});
