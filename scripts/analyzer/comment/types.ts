export type CommentType = "single-line" | "multi-line" | "jsdoc";

export interface ProjectComment {
	readonly type: CommentType;
	readonly text: string;
	readonly location: {
		readonly start: number;
		readonly end: number;
		readonly line: number;
	};
}