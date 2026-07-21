import { describe, expect, it } from "vitest";
import { diffApiSnapshots, detectImpact, bumpVersion } from "./api-diff";
import type { TApiSnapshot, TApiExportSnapshot } from "./api-snapshot";

function entry(overrides: Partial<TApiExportSnapshot> = {}): TApiExportSnapshot {
	return {
		name: "foo",
		category: "function",
		isTypeOnly: false,
		file: "src/foo/utils.ts",
		signature: "(): void",
		...overrides,
	};
}

function snapshot(exports: TApiExportSnapshot[]): TApiSnapshot {
	return { exports };
}

describe("diffApiSnapshots", () => {
	it("detects an added export", () => {
		const base = snapshot([]);
		const head = snapshot([entry({ name: "foo" })]);
		const diff = diffApiSnapshots(base, head);
		expect(diff.added.map((e) => e.name)).toEqual(["foo"]);
		expect(diff.removed).toEqual([]);
		expect(diff.changed).toEqual([]);
	});

	it("detects a removed export", () => {
		const base = snapshot([entry({ name: "foo" })]);
		const head = snapshot([]);
		const diff = diffApiSnapshots(base, head);
		expect(diff.removed.map((e) => e.name)).toEqual(["foo"]);
		expect(diff.added).toEqual([]);
	});

	it("detects a changed signature and carries both signatures", () => {
		const base = snapshot([entry({ name: "foo", signature: "(a: string): void" })]);
		const head = snapshot([entry({ name: "foo", signature: "(a: number): void" })]);
		const diff = diffApiSnapshots(base, head);
		expect(diff.changed).toEqual([
			expect.objectContaining({
				name: "foo",
				previousSignature: "(a: string): void",
				nextSignature: "(a: number): void",
			}),
		]);
	});

	it("does not report anything for an unchanged export", () => {
		const base = snapshot([entry({ name: "foo" })]);
		const head = snapshot([entry({ name: "foo" })]);
		const diff = diffApiSnapshots(base, head);
		expect(diff).toEqual({ added: [], removed: [], changed: [] });
	});
});

describe("detectImpact", () => {
	it("is major when anything was removed, even alongside additions", () => {
		expect(detectImpact({ added: [entry()], removed: [entry()], changed: [] })).toBe("major");
	});

	it("is major when anything changed", () => {
		expect(detectImpact({ added: [], removed: [], changed: [{ ...entry(), previousSignature: "a", nextSignature: "b" }] })).toBe(
			"major",
		);
	});

	it("is minor when only additions exist", () => {
		expect(detectImpact({ added: [entry()], removed: [], changed: [] })).toBe("minor");
	});

	it("is patch when nothing in the public surface changed", () => {
		expect(detectImpact({ added: [], removed: [], changed: [] })).toBe("patch");
	});
});

describe("bumpVersion", () => {
	it("bumps major and resets minor/patch", () => {
		expect(bumpVersion("2.3.4", "major")).toBe("3.0.0");
	});

	it("bumps minor and resets patch", () => {
		expect(bumpVersion("2.3.4", "minor")).toBe("2.4.0");
	});

	it("bumps patch only", () => {
		expect(bumpVersion("2.3.4", "patch")).toBe("2.3.5");
	});
});
