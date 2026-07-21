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
	getMembers(): TBlockMember[];
}

export interface JSDocTag {
	readonly name: string;
	readonly value?: string;
}

/** A class block's method/property, with documentation already resolved through any `x = Foo.bar` aliasing. */
export interface TBlockMember {
	readonly name: string;
	readonly startLine: number;
	readonly isInternal: boolean;
	/** Source text of what this member aliases (e.g. `_Object.isNull`), if it's a simple alias property. */
	readonly aliasOf?: string;
	readonly documentation?: {
		readonly description: string;
		readonly tags: JSDocTag[];
	};
}