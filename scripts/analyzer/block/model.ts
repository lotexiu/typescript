import ts from "typescript";
import { ProjectFile } from "../file/model";
import { ExportStatus, JSDocTag, ProjectBlockCode } from "./types";

export class AnalyzerBlockCode implements ProjectBlockCode {
	private _importedBy?: readonly ProjectFile[];

	constructor(
		public readonly name: string,
		public readonly category: ProjectBlockCode["category"],
		public readonly context: ProjectBlockCode["context"],
		public readonly isTypeOnly: boolean,
		public exportStatus: ExportStatus,
		public readonly location: ProjectBlockCode["location"],
		public readonly parentFile: ProjectFile,
		private readonly node: ts.Node,
		public readonly documentation?: {
			readonly description: string;
			readonly tags: JSDocTag[];
		},
	) {}

	public getText(): string {
		return this.node.getText(this.parentFile.getSourceFile());
	}

	public getAstNode(): ts.Node {
		return this.node;
	}

	/** Whether this block is tagged `@internal` — excluded from the public entry/docs surface. */
	public isInternal(): boolean {
		return this.documentation?.tags.some((t) => t.name === "internal") ?? false;
	}

	get importedBy(): readonly ProjectFile[] {
		if (this._importedBy) return this._importedBy;

		if (this.exportStatus === "not-exported") {
			this._importedBy = [];
			return this._importedBy;
		}

		const graph = this.parentFile.parentProject.getReferenceGraph();
		const set = graph.get(this.name);
		if (!set || set.size === 0) {
			this._importedBy = [];
			return this._importedBy;
		}

		const result = Array.from(set).filter((f) => f.relativePath !== this.parentFile.relativePath);
		this._importedBy = result;
		return this._importedBy;
	}
}
