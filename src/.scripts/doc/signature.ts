import { AstNode } from "@ts/language/node/model"
import { DOC_REGEX, HIDDEN_MODIFIERS, INITIALIZER_PREVIEW_LIMIT, SIGNATURE_SINGLE_LINE_LIMIT } from "./declarations"
import { JsDocUtils } from "./jsdoc"
import { TDoc, TMember, TMemberKind } from "./types"

type TLineAt = (offset: number) => number

class SignatureUtils {
	static format(text: string): string {
		const trimmed = text.trim().replace(DOC_REGEX.TRAILING_SEMICOLON, "")
		const collapsed = trimmed.replace(DOC_REGEX.WHITESPACE_RUNS, " ")
		if (collapsed.length <= SIGNATURE_SINGLE_LINE_LIMIT) return collapsed
		const lines = trimmed.split("\n")
		const indents = lines.slice(1).filter((line) => line.trim() !== "").map((line) => line.length - line.trimStart().length)
		const shared = indents.length === 0 ? 0 : Math.min(...indents)
		return [lines[0], ...lines.slice(1).map((line) => line.slice(shared))].join("\n")
	}

	static contentStart(node: AstNode, source: string): number {
		const docs = node.fieldList("doc")
		let position = docs.length === 0 ? node.start : docs[docs.length - 1].end
		while (position < node.end && source[position].trim() === "") position++
		return position
	}

	static declaration(node: AstNode, source: string): string {
		const kind = node.field("kind")!
		const body = node.field("body")
		switch (kind.text) {
			case "type":
				return SignatureUtils.format(source.slice(kind.start, node.end))
			case "interface":
			case "enum": {
				const brace = source.indexOf("{", node.field("name")!.end)
				return SignatureUtils.format(source.slice(kind.start, brace < 0 ? node.end : brace))
			}
			default:
				return SignatureUtils.format(source.slice(kind.start, body === undefined ? node.end : body.start))
		}
	}

	static variable(kind: string, declarator: AstNode, name: string): string {
		const type = declarator.field("type")
		if (type !== undefined) return `${kind} ${name}: ${SignatureUtils.format(type.text)}`
		const initializer = declarator.field("init")
		if (initializer === undefined) return `${kind} ${name}`
		return `${kind} ${name}${SignatureUtils.#preview(initializer.text)}`
	}

	static isHidden(member: AstNode): boolean {
		const name = member.field("name")?.text ?? ""
		const modifiers = member.fieldList("modifier").map((modifier) => modifier.text)
		return name.startsWith("#") || modifiers.some((modifier) => HIDDEN_MODIFIERS.has(modifier)) || JsDocUtils.isInternal(SignatureUtils.doc(member))
	}

	static doc(node: AstNode): TDoc | undefined {
		const docs = node.fieldList("doc")
		if (docs.length === 0) return undefined
		const attached = [docs[docs.length - 1]]
		for (let index = docs.length - 2; index >= 0; index--) {
			const gap = node.root.source.slice(docs[index].end, attached[0].start)
			if (DOC_REGEX.BLANK_LINE.test(gap)) break
			attached.unshift(docs[index])
		}
		const parsed = attached.map((doc) => JsDocUtils.parse(doc.text))
		return {
			description: parsed.map((doc) => doc.description).filter((description) => description !== "").join("\n\n"),
			tags: parsed.flatMap((doc) => doc.tags),
		}
	}

	static classMembers(body: AstNode | undefined, source: string, lineAt: TLineAt): TMember[] {
		if (body === undefined) return []
		return body.children.filter((member) => !SignatureUtils.isHidden(member)).flatMap((member) => SignatureUtils.#classMember(member, source, lineAt))
	}

	static typeMembers(nodes: readonly AstNode[], source: string, lineAt: TLineAt): TMember[] {
		return nodes
			.filter((member) => member.kind === "PropertySignature" && !SignatureUtils.isHidden(member))
			.map((member) => {
				const start = SignatureUtils.contentStart(member, source)
				const name = member.field("name")!
				const afterName = source.slice(name.end).trimStart().replace("?", "").trimStart()
				const kind: TMemberKind = afterName.startsWith("(") || afterName.startsWith("<") ? "method" : "property"
				return SignatureUtils.#member(name.text, kind, source.slice(start, member.end), false, lineAt(start), member)
			})
	}

	static enumMembers(node: AstNode, source: string, lineAt: TLineAt): TMember[] {
		const members: TMember[] = []
		node.walk((child) => {
			if (child.kind !== "EnumMember") return
			const start = SignatureUtils.contentStart(child, source)
			members.push(SignatureUtils.#member(child.field("name")!.text, "enumMember", source.slice(start, child.end), true, lineAt(start), child))
			return false
		})
		return members
	}

	static #member(name: string, kind: TMemberKind, signature: string, isStatic: boolean, line: number, node: AstNode, fallbackDoc?: TDoc): TMember {
		return { name, kind, signature: SignatureUtils.format(signature), isStatic, line, doc: SignatureUtils.doc(node) ?? fallbackDoc }
	}

	static #preview(text: string): string {
		const collapsed = text.replace(DOC_REGEX.WHITESPACE_RUNS, " ")
		return collapsed.length <= INITIALIZER_PREVIEW_LIMIT ? ` = ${collapsed}` : ""
	}

	static #arrowHead(arrow: AstNode, source: string): string {
		const head = source.slice(arrow.start, arrow.field("body")!.start).replace(DOC_REGEX.TRAILING_ARROW, "").trim()
		return head.startsWith("(") || head.startsWith("<") || head.startsWith("async") ? head : `(${head})`
	}

	static #classMember(member: AstNode, source: string, lineAt: TLineAt): TMember[] {
		const start = SignatureUtils.contentStart(member, source)
		const line = lineAt(start)
		const isStatic = member.fieldList("modifier").some((modifier) => modifier.text === "static")
		const name = member.field("name")?.text ?? "constructor"
		const body = member.field("body")
		switch (member.kind) {
			case "Constructor":
				return [SignatureUtils.#member("constructor", "constructor", source.slice(start, body?.start ?? member.end), false, line, member)]
			case "MethodDefinition": {
				const accessor = member.field("accessor")?.text
				const kind: TMemberKind = accessor === "get" ? "getter" : accessor === "set" ? "setter" : "method"
				return [SignatureUtils.#member(name, kind, source.slice(start, body?.start ?? member.end), isStatic, line, member)]
			}
			case "PropertyDefinition":
				return SignatureUtils.#property(member, name, start, source, isStatic, line, lineAt)
			default:
				return []
		}
	}

	static #property(member: AstNode, name: string, start: number, source: string, isStatic: boolean, line: number, lineAt: TLineAt): TMember[] {
		const value = member.field("value")
		const typed = member.field("type") !== undefined
		const prefix = isStatic ? "static " : ""
		if (value === undefined) return [SignatureUtils.#member(name, "property", source.slice(start, member.end), isStatic, line, member)]
		if (!typed && value.kind === "ArrowFunction") {
			return [SignatureUtils.#member(name, "method", `${prefix}${name}${SignatureUtils.#arrowHead(value, source)}`, isStatic, line, member)]
		}
		if (!typed && value.kind === "ObjectExpr") {
			const functions = SignatureUtils.#objectFunctions(value, name, prefix, source, isStatic, lineAt, SignatureUtils.doc(member))
			if (functions.length > 0) return functions
		}
		const head = source.slice(start, value.start).replace(DOC_REGEX.TRAILING_ASSIGNMENT, "")
		return [SignatureUtils.#member(name, "property", typed ? head : `${head}${SignatureUtils.#preview(value.text)}`, isStatic, line, member)]
	}

	static #objectFunctions(object: AstNode, owner: string, prefix: string, source: string, isStatic: boolean, lineAt: TLineAt, ownerDoc: TDoc | undefined): TMember[] {
		return object.children.flatMap((property) => {
			const key = property.field("name")?.text
			if (key === undefined) return []
			const value = property.field("value")
			const qualified = `${owner}.${key}`
			if (property.kind === "MethodProperty") {
				const head = source.slice(property.field("name")!.end, property.field("body")!.start)
				return [SignatureUtils.#member(qualified, "method", `${prefix}${qualified}${head}`, isStatic, lineAt(property.start), property, ownerDoc)]
			}
			if (value?.kind !== "ArrowFunction") return []
			return [SignatureUtils.#member(qualified, "method", `${prefix}${qualified}${SignatureUtils.#arrowHead(value, source)}`, isStatic, lineAt(property.start), property, ownerDoc)]
		})
	}
}

export { SignatureUtils }
export type { TLineAt }
