import { TApiSnapshot } from "./api-snapshot";

export type TImpact = "major" | "minor" | "patch";

export interface TApiDiffEntry {
	name: string;
	category: string;
	file: string;
}

export interface TApiDiffChangedEntry extends TApiDiffEntry {
	previousSignature: string;
	nextSignature: string;
}

export interface TApiDiff {
	added: TApiDiffEntry[];
	removed: TApiDiffEntry[];
	changed: TApiDiffChangedEntry[];
}

/**
 * Name-keyed diff between two API snapshots. A rename shows up as one `removed` + one
 * `added`, not a "renamed" entry — an accepted limitation, not worth a heuristic
 * rename-detector for this scope.
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
		if (previous.signature !== entry.signature) {
			changed.push({
				name: entry.name,
				category: entry.category,
				file: entry.file,
				previousSignature: previous.signature,
				nextSignature: entry.signature,
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
 * `removed` → major; else `changed` → major (a text-level signature diff can't reliably
 * tell a widening change — e.g. an added optional parameter — from a breaking one — e.g. a
 * removed required parameter — so any signature change is treated as potentially breaking;
 * over-bumping semver is far cheaper than shipping a real break labeled `patch`); else
 * `added` → minor; else `patch`.
 */
export function detectImpact(diff: TApiDiff): TImpact {
	if (diff.removed.length > 0) return "major";
	if (diff.changed.length > 0) return "major";
	if (diff.added.length > 0) return "minor";
	return "patch";
}

export function bumpVersion(version: string, impact: TImpact): string {
	const [major, minor, patch] = version.split(".").map((n) => parseInt(n, 10));
	if (impact === "major") return `${major + 1}.0.0`;
	if (impact === "minor") return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}
