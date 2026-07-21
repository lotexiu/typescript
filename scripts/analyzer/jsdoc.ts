import ts from "typescript";
import { JSDocTag } from "./block/types";

export type TExtractedDoc = { readonly description: string; readonly tags: JSDocTag[] } | undefined;

/** Reads the raw JSDoc attached directly to `node`, if any — no alias resolution. */
export function extractJsDoc(node: ts.Node, sf: ts.SourceFile): TExtractedDoc {
	const jsDocNodes = (node as any).jsDoc as ts.JSDoc[] | undefined;
	if (!jsDocNodes || jsDocNodes.length === 0) return undefined;

	const lastJsDoc = jsDocNodes[jsDocNodes.length - 1];
	const description = typeof lastJsDoc.comment === "string" ? lastJsDoc.comment : "";
	const tags: JSDocTag[] = [];

	if (lastJsDoc.tags) {
		for (const tag of lastJsDoc.tags) {
			const value = typeof tag.comment === "string" ? tag.comment : undefined;
			tags.push({ name: tag.tagName.getText(sf), value });
		}
	}
	return { description, tags };
}

/** Whether an extracted doc actually carries content — a description or at least one tag. */
export function hasDocContent(doc: TExtractedDoc): boolean {
	return !!doc && (doc.description.trim().length > 0 || doc.tags.length > 0);
}
