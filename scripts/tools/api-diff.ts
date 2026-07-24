import { TApiSnapshot, TApiExportSnapshot } from "./api-snapshot";

export type TImpact = "major" | "minor" | "patch";

export interface TApiDiffEntry {
	name: string;
	category: string;
	file: string;
}

export interface TApiDiffChangedEntry extends TApiDiffEntry {
	previousSignature: string;
	nextSignature: string;
	/**
	 * `"signature"` (default, omitted for non-class entries pre-dating this field): the
	 * publicly-visible type/shape changed — potentially breaking. `"body"`: only a class
	 * member's resolved implementation changed (see `getMemberBody` in `api-signature.ts`)
	 * while its type signature stayed identical — a behavior fix, not a contract change.
	 */
	kind?: "signature" | "body";
	/** Only set for `kind: "body"` — the file the changed implementation actually lives in, so callers can avoid double-counting it as a separate `internal`/`refact` file-level change. */
	implementationFile?: string;
}

export interface TApiDiff {
	added: TApiDiffEntry[];
	removed: TApiDiffEntry[];
	changed: TApiDiffChangedEntry[];
}

/**
 * Member-level diff for a class present on both sides, keyed by the member's
 * qualified `static.x`/`instance.x` name — same shape/rationale as the top-level
 * diff below, just one layer deeper. A class whose members were *only added*
 * (nothing removed or resignatured) reports zero `changed` entries here, so the
 * class itself never gets flagged as `changed` for what is really just new surface
 * area — see `diffApiSnapshots`'s class-aware branch for why this matters.
 */
function diffClassMembers(
	previous: TApiExportSnapshot,
	entry: TApiExportSnapshot,
	added: TApiDiffEntry[],
	removed: TApiDiffEntry[],
	changed: TApiDiffChangedEntry[],
): void {
	const baseMembers = new Map((previous.members ?? []).map((m) => [m.name, m]));
	const headMembers = new Map((entry.members ?? []).map((m) => [m.name, m]));

	headMembers.forEach((member, name) => {
		const previousMember = baseMembers.get(name);
		const qualifiedName = `${entry.name}.${name}`;
		if (!previousMember) {
			added.push({ name: qualifiedName, category: "member", file: entry.file });
			return;
		}
		if (previousMember.signature !== member.signature) {
			changed.push({
				name: qualifiedName,
				category: "member",
				file: entry.file,
				previousSignature: previousMember.signature,
				nextSignature: member.signature,
				kind: "signature",
			});
			return;
		}
		// Signature (type) is identical, but the resolved implementation body differs —
		// a behavior-only change invisible to type-level diffing (e.g. gutting a method's
		// logic without touching its parameter/return types).
		if (previousMember.bodyText !== undefined && member.bodyText !== undefined && previousMember.bodyText !== member.bodyText) {
			changed.push({
				name: qualifiedName,
				category: "member",
				file: entry.file,
				previousSignature: previousMember.signature,
				nextSignature: member.signature,
				kind: "body",
				implementationFile: member.implementationFile,
			});
		}
	});

	baseMembers.forEach((member, name) => {
		if (!headMembers.has(name)) {
			removed.push({ name: `${previous.name}.${name}`, category: "member", file: previous.file });
		}
	});
}

/**
 * Name-keyed diff between two API snapshots. A rename shows up as one `removed` + one
 * `added`, not a "renamed" entry — an accepted limitation, not worth a heuristic
 * rename-detector for this scope.
 *
 * Classes get an extra layer: a class present on both sides with a member-level
 * breakdown (`members`, see `api-snapshot.ts`) is diffed member-by-member instead of
 * by its single flattened signature string. Adding a brand-new static/instance
 * member to an existing class is real new API surface (`feat`/`minor`), not a
 * breaking change to the class — but the old whole-signature comparison couldn't
 * tell that apart from an existing member's signature actually changing, since both
 * make the flattened text differ. The class itself only lands in `changed` when a
 * member that existed on both sides actually changed shape (member-level `changed`
 * entries handle that; nothing removed/changed at member level means the class is
 * left out of `changed` entirely, even though its flattened signature text differs).
 */
export function diffApiSnapshots(base: TApiSnapshot, head: TApiSnapshot): TApiDiff {
	const baseByName = new Map(base.exports.map((e) => [e.name, e]));
	const headByName = new Map(head.exports.map((e) => [e.name, e]));

	const added: TApiDiffEntry[] = [];
	const removed: TApiDiffEntry[] = [];
	const changed: TApiDiffChangedEntry[] = [];

	headByName.forEach((entry, name) => {
		const previous = baseByName.get(name);
		if (!previous) {
			added.push({ name: entry.name, category: entry.category, file: entry.file });
			return;
		}
		if (entry.category === "class" && previous.category === "class" && entry.members && previous.members) {
			diffClassMembers(previous, entry, added, removed, changed);
			return;
		}
		if (previous.signature !== entry.signature) {
			changed.push({
				name: entry.name,
				category: entry.category,
				file: entry.file,
				previousSignature: previous.signature,
				nextSignature: entry.signature,
				kind: "signature",
			});
		}
	});

	baseByName.forEach((entry, name) => {
		if (!headByName.has(name)) {
			removed.push({ name: entry.name, category: entry.category, file: entry.file });
		}
	});

	added.sort((a, b) => a.name.localeCompare(b.name));
	removed.sort((a, b) => a.name.localeCompare(b.name));
	changed.sort((a, b) => a.name.localeCompare(b.name));

	return { added, removed, changed };
}

/**
 * `removed` → major; else a `changed` entry whose `kind` is `"signature"` (the default —
 * see `TApiDiffChangedEntry`) → major (a text-level signature diff can't reliably tell a
 * widening change — e.g. an added optional parameter — from a breaking one — e.g. a
 * removed required parameter — so any signature change is treated as potentially
 * breaking; over-bumping semver is far cheaper than shipping a real break labeled
 * `patch`); else `added` → minor (a `kind: "body"` entry never escalates past this on
 * its own — the member's public contract didn't change, only its implementation); else
 * `changed` (only `"body"` entries left) → patch; else `patch`.
 */
export function detectImpact(diff: TApiDiff): TImpact {
	if (diff.removed.length > 0) return "major";
	if (diff.changed.some((c) => c.kind !== "body")) return "major";
	if (diff.added.length > 0) return "minor";
	return "patch";
}

export function bumpVersion(version: string, impact: TImpact): string {
	const [major, minor, patch] = version.split(".").map((n) => parseInt(n, 10));
	if (impact === "major") return `${major + 1}.0.0`;
	if (impact === "minor") return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}
