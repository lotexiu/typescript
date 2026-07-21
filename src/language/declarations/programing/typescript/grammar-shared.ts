import { G } from "@ts/language/grammar";
import type { TRule } from "@ts/language/types";

/**
 * Regras compartilhadas entre tipos, expressões, statements e declarações do `TypescriptLang`
 * — nomes qualificados, generics (`<T, U>`), decorators e binding patterns (destructuring de
 * parâmetro/declarador). Cada arquivo `grammar-*.ts` só referencia estas por nome (`G.ref`),
 * nunca importa o objeto — sem risco de ciclo de import entre eles.
 */

/**
 * Nome (identificador ou palavra reservada) num sítio onde qualquer um serve — chave de
 * propriedade (`{ if: 1 }`) ou nome depois de `.` (`foo.default`, `a.class`): em JS de verdade
 * uma palavra reservada é um nome de propriedade válido, só não um binding.
 */
const IdentifierName: TRule = G.choice(G.tok("identifier"), G.tok("keyword"));

/** `a.b.c` — usado por tipos (`Foo.Bar<T>`) e por `import`/decorators (`@ns.Deco`). */
const EntityName: TRule = G.chain(G.tok("identifier"), (prev) => (ctx, pos) => {
	const dot = G.val(".")(ctx, pos);
	if (!dot.ok) return dot;
	const name = IdentifierName(ctx, dot.next);
	if (!name.ok) return name;
	const node = G.build(ctx, "QualifiedName", prev.start, name.captures[0].node.end, {
		left: prev,
		right: name.captures[0].node,
	});
	return { ok: true, next: name.next, captures: [{ node }] };
});

/** `<Foo, Bar<Baz>>` num sítio de uso (`Map<string, number>`, `foo<T>()`). */
const TypeArgs: TRule = G.node(
	"TypeArgs",
	G.seq(G.val("<"), G.sepBy(G.field("arg", G.ref("Type")), G.val(",")), G.val(">")),
);

/** `<const T extends X = Y>` num sítio de declaração (`class`, `function`, `interface`, `type`). */
const TypeParam: TRule = G.node(
	"TypeParam",
	G.seq(
		G.opt(G.field("modifier", G.choice(G.val("const"), G.val("in"), G.val("out")))),
		G.field("name", G.tok("identifier")),
		G.opt(G.seq(G.val("extends"), G.field("constraint", G.ref("Type")))),
		G.opt(G.seq(G.val("="), G.field("default", G.ref("Type")))),
	),
);

const TypeParams: TRule = G.node("TypeParams", G.seq(G.val("<"), G.sepBy(G.field("param", TypeParam), G.val(",")), G.val(">")));

/** `@Foo`, `@ns.Foo(a, b)` — em classe, membro ou parâmetro. */
const Decorator: TRule = G.node(
	"Decorator",
	G.seq(G.val("@"), G.field("expr", EntityName), G.opt(G.field("args", G.into("paren", G.sepBy(G.ref("AssignmentExpr"), G.val(",")))))),
);

const MODIFIER_WORDS = [
	"export", "default", "declare", "abstract", "public", "private", "protected",
	"readonly", "static", "override", "async",
] as const;

/** Um modificador solto (`export`, `static`, `readonly`, ...) — a ordem real na fonte não é validada. */
const Modifier: TRule = G.field("modifier", G.choice(...MODIFIER_WORDS.map((word) => G.val(word))));

const Modifiers: TRule = G.many(Modifier);

/**
 * Alvo de binding — identificador simples ou pattern de destructuring. Usado por parâmetros,
 * declaradores de `const`/`let`/`var` e o alvo de uma atribuição desestruturada.
 */
const BindingName: TRule = G.choice(G.tok("identifier"), G.ref("ObjectPattern"), G.ref("ArrayPattern"));

const BindingProperty: TRule = G.node(
	"BindingProperty",
	G.seq(
		G.opt(G.val("...")),
		G.field("name", G.tok("identifier")),
		G.opt(G.seq(G.val(":"), G.field("target", BindingName))),
		G.opt(G.seq(G.val("="), G.field("default", G.ref("AssignmentExpr")))),
	),
);

const ObjectPattern: TRule = G.node("ObjectPattern", G.into("block", G.sepBy(BindingProperty, G.val(","))));

const ArrayPatternElement: TRule = G.node(
	"ArrayPatternElement",
	G.seq(
		G.opt(G.val("...")),
		G.field("target", BindingName),
		G.opt(G.seq(G.val("="), G.field("default", G.ref("AssignmentExpr")))),
	),
);

const ArrayPattern: TRule = G.node("ArrayPattern", G.into("bracket", G.sepBy(ArrayPatternElement, G.val(","))));

/** Anotação de tipo opcional (`: Foo`) — parâmetro, declarador, retorno de função. */
const TypeAnnotation: TRule = G.seq(G.val(":"), G.field("type", G.ref("Type")));

/**
 * Parâmetro de função/método/arrow — inclui os modificadores de "constructor property
 * shorthand" (`constructor(private x: string)`), que em TS puro só fazem sentido num
 * construtor, mas aceitar em qualquer parâmetro é uma simplificação deliberada.
 */
const Param: TRule = G.node(
	"Param",
	G.seq(
		G.many(Decorator),
		G.many(G.field("modifier", G.choice(G.val("public"), G.val("private"), G.val("protected"), G.val("readonly"), G.val("override")))),
		G.opt(G.val("...")),
		G.field("name", BindingName),
		G.opt(G.val("?")),
		G.opt(TypeAnnotation),
		G.opt(G.seq(G.val("="), G.field("default", G.ref("AssignmentExpr")))),
	),
);

const SHARED_RULES: Record<string, TRule> = {
	IdentifierName,
	EntityName,
	TypeArgs,
	TypeParam,
	TypeParams,
	Decorator,
	Modifier,
	Modifiers,
	BindingName,
	BindingProperty,
	ObjectPattern,
	ArrayPatternElement,
	ArrayPattern,
	TypeAnnotation,
	Param,
};

export { SHARED_RULES };
