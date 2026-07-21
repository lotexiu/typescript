import { G } from "@ts/language/grammar";
import { AstNode } from "@ts/language/node/model";
import type { TRule } from "@ts/language/types";

/**
 * Gramática de expressões do `TypescriptLang` — precedência real do JS/TS, de baixo (primário)
 * pra cima (`Expression`, com o operador vírgula). Binários "achatados" via `G.binary` (1 nó
 * por nível, não 1 por operador); a cadeia postfix (`.`, `?.`, `[]`, `()`, `!`, generics em
 * chamada, template tag) via `G.chain`.
 *
 * Limitações aceitas: sem regex literal (`/…/` fica ambíguo com divisão sem contexto de lexer
 * com lookback — ver CLAUDE.md), sem JSX, ASI não é simulado (postfix `++`/`--` não distingue
 * quebra de linha), destructuring assignment (`[a, b] = x`) cai em `ArrayLiteral`/`ObjectLiteral`
 * comuns em vez de um `AssignmentPattern` dedicado.
 */

const TemplateLiteral: TRule = G.node(
	"TemplateLiteral",
	G.seq(
		G.choice(G.tok("template"), G.field("expr", G.into("templateInterp", G.ref("Expression")))),
		G.many(G.choice(G.tok("template"), G.field("expr", G.into("templateInterp", G.ref("Expression"))))),
	),
);

const SpreadElement: TRule = G.node("SpreadElement", G.seq(G.val("..."), G.field("arg", G.ref("AssignmentExpr"))));

const ArgList: TRule = G.sepBy(G.choice(SpreadElement, G.ref("AssignmentExpr")), G.val(","));

const ArrayLiteral: TRule = G.node("ArrayExpr", G.into("bracket", G.sepBy(G.choice(SpreadElement, G.ref("AssignmentExpr")), G.val(","))));

const PropertyName: TRule = G.choice(G.ref("IdentifierName"), G.tok("string"), G.tok("number"));
const ComputedPropertyName: TRule = G.node("ComputedName", G.into("bracket", G.field("expr", G.ref("AssignmentExpr"))));

const MethodProperty: TRule = G.node(
	"MethodProperty",
	G.seq(
		G.opt(G.val("async")),
		G.opt(G.val("*")),
		G.opt(G.field("accessor", G.choice(G.val("get"), G.val("set")))),
		G.field("name", G.choice(ComputedPropertyName, PropertyName)),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.field("params", G.into("paren", G.sepBy(G.ref("Param"), G.val(",")))),
		G.opt(G.ref("TypeAnnotation")),
		G.field("body", G.ref("Block")),
	),
);

const Property: TRule = G.node(
	"Property",
	G.seq(G.field("name", G.choice(ComputedPropertyName, PropertyName)), G.val(":"), G.field("value", G.ref("AssignmentExpr"))),
);

const ShorthandProperty: TRule = G.node(
	"ShorthandProperty",
	G.seq(G.field("name", G.tok("identifier")), G.opt(G.seq(G.val("="), G.field("default", G.ref("AssignmentExpr"))))),
);

const PropertyDefinition: TRule = G.choice(SpreadElement, MethodProperty, Property, ShorthandProperty);

const ObjectLiteral: TRule = G.node(
	"ObjectExpr",
	G.into("block", G.many(G.choice(G.seq(PropertyDefinition, G.opt(G.val(","))), G.skip()))),
);

const FunctionExpr: TRule = G.node(
	"FunctionExpr",
	G.seq(
		G.opt(G.val("async")),
		G.val("function"),
		G.opt(G.val("*")),
		G.opt(G.field("name", G.tok("identifier"))),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.field("params", G.into("paren", G.sepBy(G.ref("Param"), G.val(",")))),
		G.opt(G.ref("TypeAnnotation")),
		G.field("body", G.ref("Block")),
	),
);

const ParenthesizedExpr: TRule = G.node("ParenthesizedExpr", G.into("paren", G.field("expr", G.ref("Expression"))));

const PrimaryExpr: TRule = G.choice(
	G.val("this"),
	G.val("super"),
	G.val("null"),
	G.val("undefined"),
	G.val("true"),
	G.val("false"),
	G.tok("number"),
	G.tok("string"),
	TemplateLiteral,
	ArrayLiteral,
	ObjectLiteral,
	FunctionExpr,
	G.ref("ClassExpr"),
	ParenthesizedExpr,
	G.tok("identifier"),
);

/** Encadeamento `.foo`/`[expr]` só de acesso — usado pelo alvo de `new` (sem consumir a chamada). */
const memberOnlyStep = (prev: AstNode): TRule =>
	G.choice(
		(ctx, pos) => {
			const dot = G.val(".")(ctx, pos);
			if (!dot.ok) return dot;
			const prop = G.ref("IdentifierName")(ctx, dot.next);
			if (!prop.ok) return prop;
			const node = G.build(ctx, "MemberExpr", prev.start, prop.captures[0].node.end, { object: prev, property: prop.captures[0].node });
			return { ok: true, next: prop.next, captures: [{ node }] };
		},
		(ctx, pos) => {
			const result = G.into("bracket", G.field("property", G.ref("Expression")))(ctx, pos);
			if (!result.ok) return result;
			const property = result.captures[0].node;
			const node = G.build(ctx, "MemberExpr", prev.start, property.end, { object: prev, property });
			return { ok: true, next: result.next, captures: [{ node }] };
		},
	);

const NewExpr: TRule = G.node(
	"NewExpr",
	G.seq(
		G.val("new"),
		G.field("callee", G.chain(PrimaryExpr, memberOnlyStep)),
		G.opt(G.field("typeArgs", G.ref("TypeArgs"))),
		G.opt(G.field("args", G.into("paren", ArgList))),
	),
);

const postfixStep = (prev: AstNode): TRule =>
	G.choice(
		// `foo<T>(...)` — generic call; tentado antes de `<` virar comparação relacional.
		(ctx, pos) => {
			const typeArgs = G.ref("TypeArgs")(ctx, pos);
			if (!typeArgs.ok) return typeArgs;
			const args = G.into("paren", ArgList)(ctx, typeArgs.next);
			if (!args.ok) return args;
			const node = G.build(ctx, "CallExpr", prev.start, args.captures.length ? args.captures[args.captures.length - 1].node.end : prev.end, {
				callee: prev,
				typeArgs: typeArgs.captures[0].node,
				args: args.captures.map((c) => c.node),
			});
			return { ok: true, next: args.next, captures: [{ node }] };
		},
		(ctx, pos) => {
			const result = G.into("paren", ArgList)(ctx, pos);
			if (!result.ok) return result;
			const node = G.build(ctx, "CallExpr", prev.start, ctx.tokens[result.next - 1]?.end ?? prev.end, {
				callee: prev,
				args: result.captures.map((c) => c.node),
			});
			return { ok: true, next: result.next, captures: [{ node }] };
		},
		(ctx, pos) => {
			const opt = G.val("?.")(ctx, pos);
			if (!opt.ok) return opt;
			const args = G.into("paren", ArgList)(ctx, opt.next);
			if (args.ok) {
				const node = G.build(ctx, "OptionalCallExpr", prev.start, ctx.tokens[args.next - 1]?.end ?? prev.end, {
					callee: prev,
					args: args.captures.map((c) => c.node),
				});
				return { ok: true, next: args.next, captures: [{ node }] };
			}
			const prop = G.ref("IdentifierName")(ctx, opt.next);
			if (!prop.ok) return prop;
			const node = G.build(ctx, "OptionalMemberExpr", prev.start, prop.captures[0].node.end, { object: prev, property: prop.captures[0].node });
			return { ok: true, next: prop.next, captures: [{ node }] };
		},
		(ctx, pos) => {
			const dot = G.val(".")(ctx, pos);
			if (!dot.ok) return dot;
			const prop = G.ref("IdentifierName")(ctx, dot.next);
			if (!prop.ok) return prop;
			const node = G.build(ctx, "MemberExpr", prev.start, prop.captures[0].node.end, { object: prev, property: prop.captures[0].node });
			return { ok: true, next: prop.next, captures: [{ node }] };
		},
		(ctx, pos) => {
			const result = G.into("bracket", G.field("property", G.ref("Expression")))(ctx, pos);
			if (!result.ok) return result;
			const property = result.captures[0].node;
			const node = G.build(ctx, "MemberExpr", prev.start, property.end, { object: prev, property });
			return { ok: true, next: result.next, captures: [{ node }] };
		},
		(ctx, pos) => {
			const bang = G.val("!")(ctx, pos);
			if (!bang.ok) return bang;
			const node = G.build(ctx, "NonNullExpr", prev.start, ctx.tokens[pos]!.end, { expr: prev });
			return { ok: true, next: bang.next, captures: [{ node }] };
		},
		(ctx, pos) => {
			const result = TemplateLiteral(ctx, pos);
			if (!result.ok) return result;
			const quasi = result.captures[0].node;
			const node = G.build(ctx, "TaggedTemplateExpr", prev.start, quasi.end, { tag: prev, quasi });
			return { ok: true, next: result.next, captures: [{ node }] };
		},
	);

const CallExpr: TRule = G.chain(G.choice(NewExpr, PrimaryExpr), postfixStep);

const unaryPrefixOp = G.choice(G.val("!"), G.val("~"), G.val("+"), G.val("-"), G.val("typeof"), G.val("void"), G.val("delete"), G.val("await"));
const updateOp = G.choice(G.val("++"), G.val("--"));

/**
 * Prefixo (`!x`), update prefixo (`++x`) ou postfixo (`x++`) — escrita manual, não
 * `choice(node(seq(field(arg,CallExpr), op)), CallExpr)`: essa forma computaria `CallExpr` 2x
 * quando não há `++`/`--` postfixo (a maioria dos casos) — 1x tentando o padrão de update, 1x
 * de novo no fallback puro. `CallExpr` é a regra mais cara da gramática (desce toda a cadeia
 * postfix de member/call), e como `UnaryExpr` é chamado uma vez por operando em TODA expressão,
 * essa duplicação — somada à mesma duplicação em `ExponentExpr` logo abaixo — composta
 * multiplicativamente a cada nível de aninhamento (mesma classe de bug de `ConditionalExpr`,
 * mas aqui na regra mais quente do parser: chegou a travar em arquivos de ~250 linhas).
 */
const UnaryExpr: TRule = (ctx, pos) => {
	const prefixOp = unaryPrefixOp(ctx, pos);
	if (prefixOp.ok) {
		const arg = UnaryExpr(ctx, prefixOp.next);
		if (arg.ok) {
			const node = G.build(ctx, "UnaryExpr", ctx.tokens[pos]!.start, arg.captures[0].node.end, {
				op: prefixOp.captures[0].node,
				arg: arg.captures[0].node,
			});
			return { ok: true, next: arg.next, captures: [{ node }] };
		}
	}
	const prefixUpdate = updateOp(ctx, pos);
	if (prefixUpdate.ok) {
		const arg = UnaryExpr(ctx, prefixUpdate.next);
		if (arg.ok) {
			const node = G.build(ctx, "UpdateExpr", ctx.tokens[pos]!.start, arg.captures[0].node.end, {
				op: prefixUpdate.captures[0].node,
				arg: arg.captures[0].node,
			});
			return { ok: true, next: arg.next, captures: [{ node }] };
		}
	}
	const call = CallExpr(ctx, pos);
	if (!call.ok) return call;
	const postfixUpdate = updateOp(ctx, call.next);
	if (!postfixUpdate.ok) return call;
	const callNode = call.captures[0].node;
	const node = G.build(ctx, "UpdateExpr", callNode.start, ctx.tokens[postfixUpdate.next - 1]!.end, {
		arg: callNode,
		op: postfixUpdate.captures[0].node,
	});
	return { ok: true, next: postfixUpdate.next, captures: [{ node }] };
};

/** Mesma razão do JSDoc de `UnaryExpr`: computa `UnaryExpr` 1x, não 2x (associa à direita). */
const ExponentExpr: TRule = (ctx, pos) => {
	const left = UnaryExpr(ctx, pos);
	if (!left.ok) return left;
	const op = G.val("**")(ctx, left.next);
	if (!op.ok) return left;
	const right = G.ref("ExponentExpr")(ctx, op.next);
	if (!right.ok) return left;
	const leftNode = left.captures[0].node;
	const node = G.build(ctx, "BinaryExpr", leftNode.start, right.captures[0].node.end, {
		left: leftNode,
		op: op.captures[0].node,
		right: right.captures[0].node,
	});
	return { ok: true, next: right.next, captures: [{ node }] };
};

const MultiplicativeExpr: TRule = G.binary("BinaryExpr", ExponentExpr, G.choice(G.val("*"), G.val("/"), G.val("%")));
const AdditiveExpr: TRule = G.binary("BinaryExpr", MultiplicativeExpr, G.choice(G.val("+"), G.val("-")));
/** Sem `>>`/`>>>` — ver "Limitações aceitas" no topo do arquivo (ambiguidade com fechamento de generics). */
const ShiftExpr: TRule = G.binary("BinaryExpr", AdditiveExpr, G.val("<<"));
const RelationalExpr: TRule = G.binary(
	"BinaryExpr",
	ShiftExpr,
	G.choice(G.val("<="), G.val(">="), G.val("<"), G.val(">"), G.val("instanceof"), G.val("in")),
);

/** `x as Foo`, `x satisfies Foo`, `x!` já ficou no postfix — aqui só as duas keywords de tipo. */
const AsExpr: TRule = G.chain(RelationalExpr, (prev) => (ctx, pos) => {
	const kw = G.choice(G.val("as"), G.val("satisfies"))(ctx, pos);
	if (!kw.ok) return kw;
	const constKw = G.val("const")(ctx, kw.next);
	const type = constKw.ok ? constKw : G.field("type", G.ref("Type"))(ctx, kw.next);
	if (!type.ok) return type;
	const kind = kw.captures[0].node.text === "satisfies" ? "SatisfiesExpr" : "AsExpr";
	const node = G.build(ctx, kind, prev.start, ctx.tokens[type.next - 1]?.end ?? prev.end, constKw.ok ? { expr: prev } : { expr: prev, type: type.captures[0].node });
	return { ok: true, next: type.next, captures: [{ node }] };
});

const EqualityExpr: TRule = G.binary("BinaryExpr", AsExpr, G.choice(G.val("==="), G.val("!=="), G.val("=="), G.val("!=")));
const BitwiseAndExpr: TRule = G.binary("BinaryExpr", EqualityExpr, G.val("&"));
const BitwiseXorExpr: TRule = G.binary("BinaryExpr", BitwiseAndExpr, G.val("^"));
const BitwiseOrExpr: TRule = G.binary("BinaryExpr", BitwiseXorExpr, G.val("|"));
const LogicalAndExpr: TRule = G.binary("LogicalExpr", BitwiseOrExpr, G.val("&&"));
const LogicalOrExpr: TRule = G.binary("LogicalExpr", LogicalAndExpr, G.choice(G.val("||"), G.val("??")));

/**
 * `test ? true : false` — escrita "manual" (não `G.choice(node(seq(field(test,X),...)), X)`) de
 * propósito: essa forma computaria `LogicalOrExpr` 2x quando não há `?` (1x tentando o padrão
 * composto, 1x de novo no fallback) — e como `LogicalOrExpr` desce até `PrimaryExpr`, que volta
 * a subir até aqui em qualquer parêntese/argumento, essa duplicação compostava
 * multiplicativamente a cada nível de aninhamento (explosão exponencial real, não hipotética —
 * travou em arquivos de ~250 linhas). Resolvido computando o operando 1x e ramificando à mão.
 */
const ConditionalExpr: TRule = (ctx, pos) => {
	const test = LogicalOrExpr(ctx, pos);
	if (!test.ok) return test;
	const q = G.val("?")(ctx, test.next);
	if (!q.ok) return test;
	const trueResult = G.ref("AssignmentExpr")(ctx, q.next);
	if (!trueResult.ok) return test;
	const colon = G.val(":")(ctx, trueResult.next);
	if (!colon.ok) return test;
	const falseResult = G.ref("AssignmentExpr")(ctx, colon.next);
	if (!falseResult.ok) return test;
	const testNode = test.captures[0].node;
	const node = G.build(ctx, "ConditionalExpr", testNode.start, ctx.tokens[falseResult.next - 1]?.end ?? testNode.end, {
		test: testNode,
		true: trueResult.captures[0].node,
		false: falseResult.captures[0].node,
	});
	return { ok: true, next: falseResult.next, captures: [{ node }] };
};

const YieldExpr: TRule = G.node(
	"YieldExpr",
	G.seq(G.val("yield"), G.opt(G.val("*")), G.opt(G.field("arg", G.ref("AssignmentExpr")))),
);

const ArrowFunction: TRule = G.node(
	"ArrowFunction",
	G.seq(
		G.opt(G.val("async")),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.field("params", G.choice(G.into("paren", G.sepBy(G.ref("Param"), G.val(","))), G.tok("identifier"))),
		G.opt(G.ref("TypeAnnotation")),
		G.val("=>"),
		G.field("body", G.choice(G.ref("Block"), G.ref("AssignmentExpr"))),
	),
);

const ASSIGN_OPS = ["=", "+=", "-=", "*=", "/=", "%=", "**=", "&&=", "||=", "??=", "&=", "|=", "^=", "<<="] as const;
const assignOp: TRule = G.choice(...ASSIGN_OPS.map((op) => G.val(op)));

/** Mesma razão de `ConditionalExpr` acima: computa `ConditionalExpr` 1x, não 2x. */
const AssignmentExpr: TRule = (ctx, pos) => {
	const arrow = ArrowFunction(ctx, pos);
	if (arrow.ok) return arrow;
	const yieldResult = YieldExpr(ctx, pos);
	if (yieldResult.ok) return yieldResult;
	const target = ConditionalExpr(ctx, pos);
	if (!target.ok) return target;
	const opResult = assignOp(ctx, target.next);
	if (!opResult.ok) return target;
	const value = AssignmentExpr(ctx, opResult.next);
	if (!value.ok) return target;
	const targetNode = target.captures[0].node;
	const node = G.build(ctx, "AssignExpr", targetNode.start, value.captures[0].node.end, {
		target: targetNode,
		op: opResult.captures[0].node,
		value: value.captures[0].node,
	});
	return { ok: true, next: value.next, captures: [{ node }] };
};

/** Entrada da gramática de expressão — inclui o operador vírgula. Não usar dentro de listas
 * separadas por vírgula (args, elementos de array/objeto): ali a unidade é `AssignmentExpr`. */
const Expression: TRule = G.binary("SequenceExpr", AssignmentExpr, G.val(","));

const EXPR_RULES: Record<string, TRule> = {
	Expression,
	AssignmentExpr,
	ConditionalExpr,
	ArgList,
	SpreadElement,
	TemplateLiteral,
	UnaryExpr,
	ExponentExpr,
};

export { EXPR_RULES };
