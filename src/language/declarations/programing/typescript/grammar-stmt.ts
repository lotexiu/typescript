import { G } from "@ts/language/grammar";
import type { TRule } from "@ts/language/types";

/**
 * Gramática de statements do `TypescriptLang`. `StatementList` é resiliente (`G.skip()` no
 * fallback) — igual `File`, um trecho não reconhecido não trava o resto do bloco. A única
 * exceção deliberada é o corpo de um `case`/`default` (`SwitchStatement`): ali `many(Statement)`
 * roda **sem** skip-fallback, porque `Statement` já falha limpo em `case`/`default`/`}` (essas
 * palavras são `keyword`, não `identifier` — ver `declarations.ts`) e é exatamente essa falha
 * que delimita onde um `case` termina.
 */

const VariableDeclarator: TRule = G.node(
	"VariableDeclarator",
	G.seq(G.field("name", G.ref("BindingName")), G.opt(G.ref("TypeAnnotation")), G.opt(G.seq(G.val("="), G.field("init", G.ref("AssignmentExpr"))))),
);

/** `const a = 1, b: string = "x"` sem o `;` final — reusado pelo cabeçalho clássico do `for`. */
const VariableDeclClause: TRule = G.node(
	"VariableDecl",
	G.seq(
		G.field("kind", G.choice(G.val("const"), G.val("let"), G.val("var"))),
		G.sepBy(G.field("declarators", VariableDeclarator), G.val(",")),
	),
);

const VariableStatement: TRule = G.seq(VariableDeclClause, G.opt(G.val(";")));

const Block: TRule = G.node("Block", G.into("block", G.ref("StatementList")));

const IfStatement: TRule = G.node(
	"IfStatement",
	G.seq(
		G.val("if"),
		G.into("paren", G.field("test", G.ref("Expression"))),
		G.field("consequent", G.ref("Statement")),
		G.opt(G.seq(G.val("else"), G.field("alternate", G.ref("Statement")))),
	),
);

const ForOfStatement: TRule = G.node(
	"ForOfStatement",
	G.seq(
		G.val("for"),
		G.opt(G.val("await")),
		G.into(
			"paren",
			G.seq(
				G.opt(G.field("kind", G.choice(G.val("const"), G.val("let"), G.val("var")))),
				G.field("left", G.ref("BindingName")),
				G.val("of"),
				G.field("right", G.ref("AssignmentExpr")),
			),
		),
		G.field("body", G.ref("Statement")),
	),
);

const ForInStatement: TRule = G.node(
	"ForInStatement",
	G.seq(
		G.val("for"),
		G.into(
			"paren",
			G.seq(
				G.opt(G.field("kind", G.choice(G.val("const"), G.val("let"), G.val("var")))),
				G.field("left", G.ref("BindingName")),
				G.val("in"),
				G.field("right", G.ref("Expression")),
			),
		),
		G.field("body", G.ref("Statement")),
	),
);

const ForStatementClassic: TRule = G.node(
	"ForStatement",
	G.seq(
		G.val("for"),
		G.into(
			"paren",
			G.seq(
				G.opt(G.field("init", G.choice(VariableDeclClause, G.ref("Expression")))),
				G.val(";"),
				G.opt(G.field("test", G.ref("Expression"))),
				G.val(";"),
				G.opt(G.field("update", G.ref("Expression"))),
			),
		),
		G.field("body", G.ref("Statement")),
	),
);

const ForStatement: TRule = G.choice(ForOfStatement, ForInStatement, ForStatementClassic);

const WhileStatement: TRule = G.node(
	"WhileStatement",
	G.seq(G.val("while"), G.into("paren", G.field("test", G.ref("Expression"))), G.field("body", G.ref("Statement"))),
);

const DoWhileStatement: TRule = G.node(
	"DoWhileStatement",
	G.seq(
		G.val("do"),
		G.field("body", G.ref("Statement")),
		G.val("while"),
		G.into("paren", G.field("test", G.ref("Expression"))),
		G.opt(G.val(";")),
	),
);

/** Corpo de um `case`/`default` — sem skip-fallback, ver JSDoc do arquivo. */
const CaseClause: TRule = G.node(
	"CaseClause",
	G.seq(G.val("case"), G.field("test", G.ref("Expression")), G.val(":"), G.field("consequent", G.many(G.ref("Statement")))),
);

const DefaultClause: TRule = G.node(
	"DefaultClause",
	G.seq(G.val("default"), G.val(":"), G.field("consequent", G.many(G.ref("Statement")))),
);

const SwitchStatement: TRule = G.node(
	"SwitchStatement",
	G.seq(
		G.val("switch"),
		G.into("paren", G.field("discriminant", G.ref("Expression"))),
		G.into("block", G.many(G.choice(CaseClause, DefaultClause, G.skip()))),
	),
);

const CatchClause: TRule = G.node(
	"CatchClause",
	G.seq(G.opt(G.into("paren", G.field("param", G.ref("BindingName")))), G.field("body", Block)),
);

const TryStatement: TRule = G.node(
	"TryStatement",
	G.seq(
		G.val("try"),
		G.field("block", Block),
		G.opt(G.seq(G.val("catch"), G.field("handler", CatchClause))),
		G.opt(G.seq(G.val("finally"), G.field("finalizer", Block))),
	),
);

const ReturnStatement: TRule = G.node("ReturnStatement", G.seq(G.val("return"), G.opt(G.field("arg", G.ref("Expression"))), G.opt(G.val(";"))));
const ThrowStatement: TRule = G.node("ThrowStatement", G.seq(G.val("throw"), G.field("arg", G.ref("Expression")), G.opt(G.val(";"))));
const BreakStatement: TRule = G.node("BreakStatement", G.seq(G.val("break"), G.opt(G.field("label", G.tok("identifier"))), G.opt(G.val(";"))));
const ContinueStatement: TRule = G.node("ContinueStatement", G.seq(G.val("continue"), G.opt(G.field("label", G.tok("identifier"))), G.opt(G.val(";"))));
const EmptyStatement: TRule = G.node("EmptyStatement", G.val(";"));

const LabeledStatement: TRule = G.node(
	"LabeledStatement",
	G.seq(G.field("label", G.tok("identifier")), G.val(":"), G.field("body", G.ref("Statement"))),
);

const ExpressionStatement: TRule = G.node("ExpressionStatement", G.seq(G.field("expr", G.ref("Expression")), G.opt(G.val(";"))));

const Statement: TRule = G.choice(
	Block,
	VariableStatement,
	G.ref("FunctionDecl"),
	G.ref("ClassDecl"),
	G.ref("InterfaceDecl"),
	G.ref("TypeAliasDecl"),
	G.ref("EnumDecl"),
	IfStatement,
	ForStatement,
	WhileStatement,
	DoWhileStatement,
	SwitchStatement,
	TryStatement,
	ReturnStatement,
	ThrowStatement,
	BreakStatement,
	ContinueStatement,
	EmptyStatement,
	LabeledStatement,
	ExpressionStatement,
);

const StatementList: TRule = G.many(G.choice(Statement, G.skip()));

const STMT_RULES: Record<string, TRule> = {
	Statement,
	StatementList,
	Block,
	VariableDeclarator,
	VariableDeclClause,
};

export { STMT_RULES };
