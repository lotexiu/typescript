import { ProjectFile } from "../file/model";
import ts from "typescript";

export type ExportStatus = "declaration-export" | "local-reexport" | "not-exported";

export interface ProjectBlockCode {
	readonly name: string;
	readonly category: "class" | "interface" | "type" | "function" | "const" | "enum" | "unknown";
	readonly context: "global" | "module" | "local";
	readonly isTypeOnly: boolean;
	exportStatus: ExportStatus;
	readonly documentation?: {
		readonly description: string;
		readonly tags: JSDocTag[];
	};
	readonly location: {
		readonly file: string;
		readonly start: number;
		readonly end: number;
		readonly startLine: number;
		readonly endLine: number;
	};
	readonly parentFile: ProjectFile;
	readonly importedBy: readonly ProjectFile[];
	getText(): string;
	getAstNode(): ts.Node;
	isInternal(): boolean;
}

export interface JSDocTag {
	readonly name: string;
	readonly value?: string;
}