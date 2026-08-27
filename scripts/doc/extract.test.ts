import { describe, expect, it } from "vitest"
import { extractSource, parseJsDoc } from "./extract"

const decls = (source: string) => extractSource(source, "x.ts").declarations

describe("extractSource", () => {
	it("pega kind, nome e linha de cada declaração top-level", () => {
		const d = decls([
			"const a = 1",
			"function foo() {}",
			"class Bar {}",
			"type T = string",
			"interface I {}",
			"enum E {}",
		].join("\n"))
		expect(d.map((x) => [x.kind, x.name, x.line])).toEqual([
			["const", "a", 1],
			["function", "foo", 2],
			["class", "Bar", 3],
			["type", "T", 4],
			["interface", "I", 5],
			["enum", "E", 6],
		])
	})

	it("marca exported por modificador inline e por bloco `export { }` no fim", () => {
		const d = decls([
			"export const a = 1",
			"const b = 2",
			"const c = 3",
			"export { b, c as d }",
		].join("\n"))
		expect(d.find((x) => x.name === "a")?.exported).toBe(true)
		expect(d.find((x) => x.name === "b")?.exported).toBe(true)
		expect(d.find((x) => x.name === "c")?.exported).toBe(true)
	})

	it("não desce em corpos de função/classe (nada de locais)", () => {
		const d = decls([
			"function outer() {",
			"  const inner = 1",
			"  function nested() {}",
			"}",
			"class C { method() { const z = 2 } }",
		].join("\n"))
		expect(d.map((x) => x.name)).toEqual(["outer", "C"])
	})

	it("associa o JSDoc imediatamente anterior à declaração", () => {
		const d = decls([
			"/**",
			" * Faz a coisa.",
			" * @internal",
			" * @param x o valor",
			" */",
			"export function doThing(x) {}",
		].join("\n"))
		expect(d).toHaveLength(1)
		expect(d[0].doc?.description).toBe("Faz a coisa.")
		expect(d[0].doc?.tags).toEqual([
			{ name: "internal", value: undefined },
			{ name: "param", value: "x o valor" },
		])
	})

	it("comentário de bloco comum (`/* */`) não vira doc", () => {
		const d = decls(["/* nota qualquer */", "const a = 1"].join("\n"))
		expect(d[0].doc).toBeUndefined()
	})

	it("ignora conteúdo dentro de strings", () => {
		const d = decls('const sql = "class Fake {"\nconst real = 2')
		expect(d.map((x) => x.name)).toEqual(["sql", "real"])
	})
})

describe("parseJsDoc", () => {
	it("separa descrição multilinha das tags", () => {
		const doc = parseJsDoc("/**\n * linha um\n * linha dois\n * @see algo\n */")
		expect(doc.description).toBe("linha um\nlinha dois")
		expect(doc.tags).toEqual([{ name: "see", value: "algo" }])
	})
})
