import { AnalyzerProject } from "../analyzer/model";
import { isTestFile } from "./index-generator";
import { getSignatureText } from "./api-signature";

export interface TApiExportSnapshot {
	name: string;
	category: string;
	isTypeOnly: boolean;
	file: string;
	signature: string;
}

export interface TApiSnapshot {
	exports: TApiExportSnapshot[];
}

/**
 * Compact snapshot of the project's public API surface, used to diff two states
 * (base branch vs. head) without needing an external clone/build reference. Reuses
 * the same "public" resolution `index-generator.ts`/`docs-generator.ts` already use
 * (not `@internal`-tagged, and actually exported) — every non-internal entry in
 * `file.exports` for a non-entry, non-test file.
 */
export function buildApiSnapshot(project: AnalyzerProject, entry = "src/index.ts"): TApiSnapshot {
	const exports: TApiExportSnapshot[] = [];

	project.files.forEach((file) => {
		if (file.relativePath === entry) return;
		if (isTestFile(file)) return;

		file.exports.forEach((exp) => {
			const block = exp.blockCode;
			if (block.isInternal()) return;

			exports.push({
				name: exp.name,
				category: block.category,
				isTypeOnly: block.isTypeOnly,
				file: block.location.file,
				signature: getSignatureText(block, project.dir),
			});
		});
	});

	exports.sort((a, b) => a.name.localeCompare(b.name) || a.file.localeCompare(b.file));

	return { exports };
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const project = new AnalyzerProject(process.cwd());
	console.log(JSON.stringify(buildApiSnapshot(project), null, 2));
}
