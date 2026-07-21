import { ProjectBlockCode } from "./block/types";

export interface ProjectExport {
	readonly name: string;
	readonly isDefault: boolean;
	readonly blockCode: ProjectBlockCode;
}

export interface ResolvedAlias {
	find: RegExp | string;
	replacement: string
}