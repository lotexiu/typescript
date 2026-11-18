import { DOC_REGEX } from "./declarations"
import { TDoc, TDocTag } from "./types"

class JsDocUtils {
	static parse(raw: string): TDoc {
		const body = raw.replace(DOC_REGEX.JSDOC_OPEN, "").replace(DOC_REGEX.JSDOC_CLOSE, "")
		const lines = body.split("\n").map((line) => line.replace(DOC_REGEX.JSDOC_LINE_PREFIX, "").trimEnd())
		const description: string[] = []
		const tags: { name: string; lines: string[] }[] = []
		for (const line of lines) {
			const tag = DOC_REGEX.TAG.exec(line)
			if (tag) tags.push({ name: tag[1], lines: tag[2] === "" ? [] : [tag[2]] })
			else if (tags.length === 0) description.push(line)
			else tags[tags.length - 1].lines.push(line)
		}
		return {
			description: description.join("\n").trim(),
			tags: tags.map(({ name, lines: tagLines }): TDocTag => {
				const value = tagLines.join("\n").trim()
				return value === "" ? { name } : { name, value }
			}),
		}
	}

	static isInternal(doc: TDoc | undefined): boolean {
		return doc?.tags.some((tag) => tag.name === "internal") ?? false
	}

	static isDocumented(doc: TDoc | undefined): boolean {
		return doc !== undefined && doc.description !== ""
	}
}

export { JsDocUtils }
