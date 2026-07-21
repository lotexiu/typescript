import { G } from "@ts/language/grammar";
import type { TRule } from "@ts/language/types";

/**
 * Gramática de tipos do `TypescriptLang`. Segue a precedência real do TS de baixo pra cima:
 * `PrimaryType` (referência, literal, objeto, tupla, parêntese) → sufixos postfix (`[]`,
 * indexed access) → operadores prefixos (`keyof`/`typeof`/`readonly`/`infer`) → `&` → `|` →
 * função/construtor (`(...) => T`) → condicional (`T extends U ? A : B`) → `Type` (entrada).
 *
 * Limitações aceitas: sem mapped types com todos os modificadores (`+`/`-` em `readonly`/`?`),
 * sem template literal types com substituição estruturada (o token `template` é tratado como
 * folha opaca), `satisfies`/`as const` ficam na camada de expressão, não na de tipo.
 */

const PrimitiveType: TRule = G.choice(
	...["string", "number", "boolean", "bigint", "symbol", "object", "any", "unknown", "never", "void", "undefined", "null", "this"].map(
		(word) => G.val(word),
	),
);

const NegativeLiteralType: TRule = G.node("NegativeLiteralType", G.seq(G.val("-"), G.field("value", G.tok("number"))));

const LiteralType: TRule = G.choice(NegativeLiteralType, G.tok("string"), G.tok("number"), G.tok("template"), G.val("true"), G.val("false"));

/** `typeof foo.bar` — só o lado de valor, sem `typeof import(...)`. */
const TypeQuery: TRule = G.node("TypeQuery", G.seq(G.val("typeof"), G.field("expr", G.ref("EntityName")), G.opt(G.field("args", G.ref("TypeArgs")))));

const TypeRef: TRule = G.node("TypeRef", G.seq(G.field("name", G.ref("EntityName")), G.opt(G.field("args", G.ref("TypeArgs")))));

/** `(a: string, b?: number) => T` — parâmetros na forma de tipo (nome opcional, sem default). */
const FunctionTypeParam: TRule = G.node(
	"FunctionTypeParam",
	G.seq(
		G.opt(G.val("...")),
		G.field("name", G.tok("identifier")),
		G.opt(G.val("?")),
		G.opt(G.ref("TypeAnnotation")),
	),
);

const FunctionType: TRule = G.node(
	"FunctionType",
	G.seq(
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.field("params", G.into("paren", G.sepBy(FunctionTypeParam, G.val(",")))),
		G.val("=>"),
		G.field("returnType", G.ref("Type")),
	),
);

const ConstructorType: TRule = G.node(
	"ConstructorType",
	G.seq(
		G.opt(G.val("abstract")),
		G.val("new"),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.field("params", G.into("paren", G.sepBy(FunctionTypeParam, G.val(",")))),
		G.val("=>"),
		G.field("returnType", G.ref("Type")),
	),
);

const TupleElement: TRule = G.node(
	"TupleElement",
	G.seq(
		G.opt(G.val("...")),
		G.opt(G.seq(G.field("label", G.tok("identifier")), G.opt(G.val("?")), G.val(":"))),
		G.field("type", G.ref("Type")),
	),
);

const TupleType: TRule = G.node("TupleType", G.into("bracket", G.sepBy(TupleElement, G.val(","))));

const ParenthesizedType: TRule = G.node("ParenthesizedType", G.into("paren", G.ref("Type")));

/** Membro de object type / interface: assinatura de propriedade, método, index signature ou mapped type. */
const IndexSignature: TRule = G.node(
	"IndexSignature",
	G.seq(
		G.opt(G.field("modifier", G.val("readonly"))),
		G.into(
			"bracket",
			G.seq(G.field("name", G.tok("identifier")), G.val(":"), G.field("keyType", G.ref("Type"))),
		),
		G.ref("TypeAnnotation"),
	),
);

/** `[K in Keys]: T` — mapped type. */
const MappedTypeMember: TRule = G.node(
	"MappedTypeMember",
	G.seq(
		G.opt(G.field("modifier", G.choice(G.val("readonly"), G.val("+"), G.val("-")))),
		G.into(
			"bracket",
			G.seq(
				G.field("name", G.tok("identifier")),
				G.val("in"),
				G.field("constraint", G.ref("Type")),
				G.opt(G.seq(G.val("as"), G.field("as", G.ref("Type")))),
			),
		),
		G.opt(G.val("?")),
		G.opt(G.ref("TypeAnnotation")),
	),
);

const PropertySignature: TRule = G.node(
	"PropertySignature",
	G.seq(
		G.opt(G.field("modifier", G.val("readonly"))),
		G.field("name", G.choice(G.ref("IdentifierName"), G.tok("string"), G.tok("number"))),
		G.opt(G.val("?")),
		G.choice(
			// method signature: (...) : T
			G.seq(
				G.opt(G.field("typeParams", G.ref("TypeParams"))),
				G.field("params", G.into("paren", G.sepBy(FunctionTypeParam, G.val(",")))),
				G.opt(G.ref("TypeAnnotation")),
			),
			G.opt(G.ref("TypeAnnotation")),
		),
	),
);

const TypeMember: TRule = G.choice(MappedTypeMember, IndexSignature, PropertySignature);

/** Lista de membros "crua" — reusada por `InterfaceDecl` (que envolve o próprio nó `Declaration`, não `ObjectType`). */
const ObjectTypeMembers: TRule = G.many(G.choice(G.seq(TypeMember, G.opt(G.choice(G.val(","), G.val(";")))), G.skip()));

const ObjectType: TRule = G.node("ObjectType", G.into("block", ObjectTypeMembers));

const PrimaryType: TRule = G.choice(
	FunctionType,
	ConstructorType,
	ObjectType,
	TupleType,
	ParenthesizedType,
	TypeQuery,
	LiteralType,
	PrimitiveType,
	TypeRef,
);

/** Sufixos postfix: `T[]` (array) e `T[K]` (indexed access) — a mesma sintaxe `[...]`. */
const ArrayOrIndexedType: TRule = G.chain(PrimaryType, (prev) => (ctx, pos) => {
	const inner = G.into("bracket", G.opt(G.field("index", G.ref("Type"))))(ctx, pos);
	if (!inner.ok) return inner;
	const indexNode = inner.captures.find((capture) => capture.field === "index")?.node;
	const kind = indexNode ? "IndexedAccessType" : "ArrayType";
	const node = G.build(ctx, kind, prev.start, ctx.tokens[inner.next - 1]?.end ?? prev.end, indexNode ? { object: prev, index: indexNode } : { element: prev });
	return { ok: true, next: inner.next, captures: [{ node }] };
});

/** `keyof`/`readonly`/`infer`/`unique` — prefixo, associa à direita. */
const TypeOperator: TRule = G.choice(
	G.node("TypeOperator", G.seq(G.field("op", G.choice(G.val("keyof"), G.val("readonly"), G.val("infer"), G.val("unique"))), G.field("operand", G.ref("TypeOperatorOperand")))),
	ArrayOrIndexedType,
);

const IntersectionType: TRule = G.binary("IntersectionType", TypeOperator, G.val("&"));
const UnionType: TRule = G.binary("UnionType", IntersectionType, G.val("|"));

/**
 * `check extends extendsType ? true : false` — escrita manual, não `choice(node(seq(field(check,
 * UnionType),...)), UnionType)`: essa forma recomputaria `UnionType` 2x quando não há `extends`
 * (1x tentando o padrão composto, 1x de novo no fallback), e como `Type` é referenciado em
 * praticamente todo lugar (qualquer anotação de tipo, generic, tipo de retorno), a duplicação
 * composta multiplicativamente a cada nível de aninhamento — explosão exponencial real (ver a
 * mesma nota em `ConditionalExpr`, `grammar-expr.ts`).
 */
const ConditionalType: TRule = (ctx, pos) => {
	const check = UnionType(ctx, pos);
	if (!check.ok) return check;
	const extendsKw = G.val("extends")(ctx, check.next);
	if (!extendsKw.ok) return check;
	const extendsType = UnionType(ctx, extendsKw.next);
	if (!extendsType.ok) return check;
	const q = G.val("?")(ctx, extendsType.next);
	if (!q.ok) return check;
	const trueType = G.ref("Type")(ctx, q.next);
	if (!trueType.ok) return check;
	const colon = G.val(":")(ctx, trueType.next);
	if (!colon.ok) return check;
	const falseType = G.ref("Type")(ctx, colon.next);
	if (!falseType.ok) return check;
	const checkNode = check.captures[0].node;
	const node = G.build(ctx, "ConditionalType", checkNode.start, ctx.tokens[falseType.next - 1]?.end ?? checkNode.end, {
		check: checkNode,
		extends: extendsType.captures[0].node,
		true: trueType.captures[0].node,
		false: falseType.captures[0].node,
	});
	return { ok: true, next: falseType.next, captures: [{ node }] };
};

const Type: TRule = ConditionalType;

const TYPE_RULES: Record<string, TRule> = {
	Type,
	TypeOperatorOperand: TypeOperator,
	TypeRef,
	ObjectTypeMembers,
};

export { TYPE_RULES };
