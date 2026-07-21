import path from "path";
import { AnalyzerProject } from "../analyzer/model";
import { logger } from "../logger";
import { isTestFile } from "./index-generator";

const ALLOWED_FILE_NAMES = new Set([
	"types",
	"types.native",
	"implementations",
	"utils",
	"model",
	"declarations",
]);

export function validateProject(project: AnalyzerProject, entry: string) {
	project.getReferenceGraph();

	const fileWarnings = new Map<string, string[]>();

	project.files.forEach((file) => {
		if (file.relativePath === entry) return;
		if (isTestFile(file)) return;

		const relativePath = file.relativePath;
		const baseName = path.basename(relativePath, path.extname(relativePath));
		const warningsByFile: string[] = [];

		if (!ALLOWED_FILE_NAMES.has(baseName)) {
			warningsByFile.push(
				`Unusual file name: ${relativePath}. Expected one of: ${[...ALLOWED_FILE_NAMES].join(", ")}.`,
			);
		}

		file.exports.forEach((exp) => {
			const block = exp.blockCode;
			const name = exp.name;

			if (name.startsWith("_")) {
				if (!block.isInternal()) {
					warningsByFile.push(
						`Name "${name}" starts with "_" but is missing @internal tag.`,
					);
				}
			}

			if (block.isTypeOnly && !name.startsWith("T")) {
				warningsByFile.push(
					`Type-only export "${name}" should start with "T".`,
				);
			}

			if (!block.isInternal() && !block.documentation?.description.trim()) {
				warningsByFile.push(
					`Public export "${name}" has no documentation.`,
				);
			}

			if (block.exportStatus === "declaration-export") {
				warningsByFile.push(
					`Export "${name}" is declared directly on the signature. Prefer reexport from index.`,
				);

				const hasTestFile = block.importedBy.some((f) => isTestFile(f));
				if (!hasTestFile) {
					warningsByFile.push(
						`Runtime export "${name}" has no corresponding test file.`,
					);
				}

				if (block.importedBy.length === 0) {
					warningsByFile.push(
						`Export "${name}" appears unused in the project.`,
					);
				}
			}
		});

		(file.blocks ?? []).forEach((block) => {
			if (block.category !== "class") return;
			for (const { message } of block.getUndocumentedMembers()) {
				warningsByFile.push(message);
			}
		});

		if (warningsByFile.length > 0) {
			fileWarnings.set(relativePath, warningsByFile);
		}
	});

	if (fileWarnings.size === 0) {
		logger.success("Project validation passed with no warnings.");
	} else {
		logger.warn(`Project validation found ${fileWarnings.size} file(s) with warnings:`);
		for (const [filePath, fileWarn] of fileWarnings.entries()) {
			logger.info(`\n  ${filePath}:`);
			for (const warning of fileWarn) {
				logger.warn(`    - ${warning}`);
			}
		}
	}
}
