import ts from "typescript";
import { ProjectComment } from "./types";

export function extractCommentsFromText(
	triviaText: string,
	offset: number,
	sf: ts.SourceFile,
): ProjectComment[] {
	const comments: ProjectComment[] = [];
	let pos = 0;

	while (pos < triviaText.length) {
		const ch = triviaText.charCodeAt(pos);
		if (ch === 47 && triviaText.charCodeAt(pos + 1) === 47) {
			let end = triviaText.indexOf("\n", pos);
			if (end === -1) end = triviaText.length;
			const commentText = triviaText.substring(pos, end);
			const startPos = offset + pos;
			const endPos = offset + end;

			comments.push({
				type: "single-line",
				text: commentText,
				location: {
					start: startPos,
					end: endPos,
					line: sf.getLineAndCharacterOfPosition(startPos).line + 1,
				},
			});
			pos = end;
		} else if (ch === 47 && triviaText.charCodeAt(pos + 1) === 42) {
			const end = triviaText.indexOf("*/", pos);
			if (end !== -1) {
				const totalEnd = end + 2;
				const commentText = triviaText.substring(pos, totalEnd);
				const isJSDoc = commentText.startsWith("/**");
				const startPos = offset + pos;
				const endPos = offset + totalEnd;

				if (!isJSDoc) {
					comments.push({
						type: "multi-line",
						text: commentText,
						location: {
							start: startPos,
							end: endPos,
							line: sf.getLineAndCharacterOfPosition(startPos).line + 1,
						},
					});
				}
				pos = totalEnd;
			} else {
				pos++;
			}
		} else {
			pos++;
		}
	}

	return comments;
}
