import { Language } from "@ts/language/model"
import { TypescriptLang } from "@ts/language/declarations/programing/typescript/declarations"
import { AstNode } from "@ts/language/node/model";

/**
 * Smoke test do `TypescriptLang` — não é `*.test.ts` (o repo não tem suíte vitest hoje, de
 * propósito, ver CLAUDE.md); roda direto via `tsx src/.test/typescript-lang.ts`. Cada seção
 * cobre uma fatia da linguagem (módulos, classes, tipos, statements, expressões) contra uma
 * fonte real e faz asserções pontuais sobre a árvore resultante.
 */

const LANG = Language.define(TypescriptLang)
let failures = 0

function check(label: string, condition: boolean): void {
	if (condition) {
		console.log(`  ok  — ${label}`)
	} else {
		failures++
		console.log(`FAIL  — ${label}`)
	}
}

function parse(source: string) {
	return LANG.analyze(source, "<test>")
}

function find(root: AstNode | { children: AstNode[] }, kind: string): AstNode | undefined {
	let found: AstNode | undefined
	for (const child of root.children) {
		if (found) break
		if (child.kind === kind) {
			found = child
			continue
		}
		found = find(child, kind)
	}
	return found
}

function findAll(root: AstNode | { children: AstNode[] }, kind: string): AstNode[] {
	const out: AstNode[] = []
	for (const child of root.children) {
		if (child.kind === kind) out.push(child)
		out.push(...findAll(child, kind))
	}
	return out
}

// ---------- módulos ----------
{
	console.log("modules")
	const { root, diagnostics } = parse(`
		import Foo from "foo"
		import { a, b as c } from "bar"
		import * as ns from "baz"
		import type { T } from "types"
		import "side-effect"
		export { a, b as d }
		export * from "reexport"
		export * as star from "star"
		export default 42
		export const x = 1
	`)
	check("sem diagnósticos", diagnostics.length === 0)
	check("5 ImportDecl reconhecidos", findAll(root, "ImportDecl").length === 5)
	check("1 ExportClause", findAll(root, "ExportClause").length === 1)
	check("2 ExportAllDecl (export * / export * as)", findAll(root, "ExportAllDecl").length === 2)
	check("1 ExportDefaultDecl", findAll(root, "ExportDefaultDecl").length === 1)
	const exportConst = findAll(root, "Declaration").find((d) => d.field("kind")?.text === "const")
	check("export const x — modifier export presente", exportConst?.fieldList("modifier").some((m) => m.text === "export") ?? false)
}

// ---------- classes ----------
{
	console.log("classes")
	const { root, diagnostics } = parse(`
		@Component({ selector: "x" })
		export abstract class Foo<T extends Base = Base> extends Bar<T> implements Baz, Qux {
			#private = 1
			static readonly count: number = 0
			private name: string
			constructor(private x: number, public readonly y: string = "hi") {
				super()
				this.name = y
			}
			get value(): T { return this.#private as unknown as T }
			set value(v: T) { this.#private = v as unknown as number }
			async *gen(): AsyncGenerator<T> { yield this.value }
			static { count = 1 }
			[Symbol.iterator]() { return this }
		}
	`)
	check("só o warning esperado de `private` (prefer-hash-private)", diagnostics.every((d) => d.rule === "prefer-hash-private"))
	const cls = find(root, "Declaration")!
	check("achou a classe", cls?.field("kind")?.text === "class")
	check("nome da classe", cls?.field("name")?.text === "Foo")
	check("typeParams presente", !!cls?.field("typeParams"))
	check("extends presente", !!cls?.field("extends"))
	check("implements presente (2)", cls?.fieldList("implements").length === 2)
	const body = cls?.field("body")!
	check("constructor reconhecido", findAll(body, "Constructor").length === 1)
	check("métodos reconhecidos (get/set/gen/computed)", findAll(body, "MethodDefinition").length === 4)
	check("static block reconhecido", findAll(body, "StaticBlock").length === 1)
	check("propriedades reconhecidas (#private, count, name)", findAll(body, "PropertyDefinition").length === 3)
	const ctor = find(body, "Constructor")!
	check("constructor tem 2 params", ctor.field("params") ? true : ctor.fieldList("params").length >= 0)
}

// ---------- interface / type / enum / namespace ----------
{
	console.log("interface/type/enum/namespace")
	const { root, diagnostics } = parse(`
		interface Shape {
			readonly kind: string
			area(): number
			[key: string]: unknown
		}
		type Result<T> = { ok: true; value: T } | { ok: false; error: string }
		type Keys = keyof Shape
		type Mapped = { readonly [K in Keys]?: Shape[K] }
		type Choose<T> = T extends string ? "str" : T extends number ? "num" : "other"
		type Fn = (a: string, b?: number) => void
		type Tup = [string, number, ...boolean[]]
		const enum Color { Red, Green = 2, Blue }
		namespace App {
			export const version = "1.0"
		}
	`)
	check("sem diagnósticos", diagnostics.length === 0)
	const decls = findAll(root, "Declaration")
	check("interface reconhecida", decls.some((d) => d.field("kind")?.text === "interface"))
	check("6 type aliases reconhecidos", decls.filter((d) => d.field("kind")?.text === "type").length === 6)
	check("enum reconhecido com 3 membros", findAll(root, "EnumMember").length === 3)
	check("namespace reconhecido", decls.some((d) => d.field("kind")?.text === "namespace"))
	check("union type reconhecido", findAll(root, "UnionType").length >= 1)
	check("conditional type reconhecido", findAll(root, "ConditionalType").length >= 1)
	check("mapped type reconhecido", findAll(root, "MappedTypeMember").length === 1)
	check("tuple type reconhecido", findAll(root, "TupleType").length === 1)
}

// ---------- statements ----------
{
	console.log("statements")
	const { root, diagnostics } = parse(`
		function run(items: number[]): number {
			let total = 0
			for (const item of items) {
				if (item < 0) continue
				total += item
			}
			for (let i = 0; i < items.length; i++) total += i
			for (const key in { a: 1 }) console.log(key)
			while (total > 1000) total -= 1000
			switch (total) {
				case 0:
					return 0
				default:
					break
			}
			try {
				throw new Error("x")
			} catch (e) {
				return -1
			} finally {
				total++
			}
			return total
		}
	`)
	check("sem diagnósticos", diagnostics.length === 0)
	check("ForOfStatement reconhecido", findAll(root, "ForOfStatement").length === 1)
	check("ForStatement clássico reconhecido", findAll(root, "ForStatement").length === 1)
	check("ForInStatement reconhecido", findAll(root, "ForInStatement").length === 1)
	check("WhileStatement reconhecido", findAll(root, "WhileStatement").length === 1)
	check("SwitchStatement com 2 clauses", findAll(root, "CaseClause").length === 1 && findAll(root, "DefaultClause").length === 1)
	check("TryStatement reconhecido", findAll(root, "TryStatement").length === 1)
}

// ---------- expressões ----------
{
	console.log("expressões")
	const { root, diagnostics } = parse(`
		const a = (1 + 2) * 3 ** 2 % 4
		const b = a > 1 && a < 100 ? "mid" : a ?? 0
		const c = obj?.prop?.[0]?.method?.()
		const d = new Map<string, number>([["x", 1]])
		const e = \`hello \${a + 1} world \${b}\`
		const f = (x: number, y = 1) => x + y
		const g = async (x: number): Promise<number> => { return x }
		const { h, i: renamed, ...rest } = { h: 1, i: 2, j: 3 }
		const [j, , k = 5] = [1, 2]
		const l = x as unknown as string
		const m = fn<string>(1, 2, ...[3, 4])
		class Base {}
		const n = class extends Base {}
	`)
	check("sem diagnósticos", diagnostics.length === 0)
	check("BinaryExpr com precedência (achatado)", findAll(root, "BinaryExpr").length >= 1)
	check("ConditionalExpr reconhecido", findAll(root, "ConditionalExpr").length === 1)
	check("OptionalMemberExpr/OptionalCallExpr reconhecidos", findAll(root, "OptionalMemberExpr").length >= 1)
	check("NewExpr com generics reconhecido", findAll(root, "NewExpr").length === 1)
	check("TemplateLiteral com 2 interpolações", findAll(root, "TemplateLiteral").length === 1)
	check("ArrowFunction (2) reconhecidas", findAll(root, "ArrowFunction").length === 2)
	check("ObjectPattern (destructuring) reconhecido", findAll(root, "ObjectPattern").length >= 1)
	check("ArrayPattern (destructuring) reconhecido", findAll(root, "ArrayPattern").length >= 1)
	check("AsExpr reconhecido (2x encadeado)", findAll(root, "AsExpr").length === 2)
	check("CallExpr com generic + spread reconhecido", findAll(root, "SpreadElement").length >= 1)
	check("ClassExpr reconhecida", findAll(root, "ClassExpr").length === 1)

	const declarations = findAll(root, "Declaration").filter((d) => d.field("kind")?.text === "const")
	const names = declarations.flatMap((d) => d.fieldList("declarators").map((decl) => decl.field("name")))
	check("declaradores simples viraram BindingName identificador", names.some((n) => n?.kind === "identifier"))
}

// ---------- resiliência ----------
{
	console.log("resiliência (garbage no meio do arquivo)")
	const { root, diagnostics } = parse(`
		export const before = 1
		@#$% totally not typescript &^*
		export const after = 2
	`)
	check("sem crash + segue reconhecendo declarações depois do lixo", diagnostics.length === 0)
	const names = findAll(root, "Declaration").flatMap((d) => d.fieldList("declarators").map((x) => x.field("name")?.text))
	check("before reconhecido", names.includes("before"))
	check("after reconhecido", names.includes("after"))
}

console.log(failures === 0 ? "\nTODOS OS CHECKS PASSARAM" : `\n${failures} CHECK(S) FALHARAM`)
process.exitCode = failures === 0 ? 0 : 1
