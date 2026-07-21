import { G } from "@ts/language/grammar";
import type { TRule } from "@ts/language/types";

/**
 * Gramática de declarações de topo do `TypescriptLang`: `import`/`export`, `class`/`interface`/
 * `type`/`function`/`const`/`let`/`var`/`enum`/`namespace`, membros de classe, `declare global`.
 *
 * Todas as variantes de declaração (`FunctionDecl`, `ClassDecl`, `InterfaceDecl`,
 * `TypeAliasDecl`, `EnumDecl`, `NamespaceDecl`, `VariableDecl`) são regras **nomeadas
 * separadas** — cada uma referenciável por `G.ref` (o `Statement` de `grammar-stmt.ts` referencia
 * cada uma individualmente, pra permitir declaração aninhada dentro de função) — mas todas
 * produzem o mesmo `AstNode.kind = "Declaration"` (2º argumento de `G.node`, independente do
 * nome da regra), com um campo `kind` (a keyword) e `name` diferenciando a variante. É assim
 * que `scripts/doc/extract.ts` consegue continuar tratando qualquer declaração de topo de forma
 * uniforme (`node.kind === "Declaration"`) sem saber da keyword específica.
 */

const PropertyKeyComputed: TRule = G.node("ComputedName", G.into("bracket", G.field("expr", G.ref("AssignmentExpr"))));
const PropertyKey: TRule = G.choice(PropertyKeyComputed, G.ref("IdentifierName"), G.tok("string"), G.tok("number"));

const HeritageExtends: TRule = G.seq(G.val("extends"), G.field("extends", G.ref("TypeRef")));
const HeritageExtendsList: TRule = G.seq(G.val("extends"), G.sepBy(G.field("extends", G.ref("TypeRef")), G.val(",")));
const HeritageImplements: TRule = G.seq(G.val("implements"), G.sepBy(G.field("implements", G.ref("TypeRef")), G.val(",")));

const StaticBlock: TRule = G.node("StaticBlock", G.seq(G.val("static"), G.field("body", G.ref("Block"))));

const ClassConstructor: TRule = G.node(
	"Constructor",
	G.seq(
		G.many(G.ref("Decorator")),
		G.ref("Modifiers"),
		G.val("constructor"),
		G.field("params", G.into("paren", G.sepBy(G.ref("Param"), G.val(",")))),
		G.choice(G.field("body", G.ref("Block")), G.val(";")),
	),
);

const ClassMethod: TRule = G.node(
	"MethodDefinition",
	G.seq(
		G.many(G.ref("Decorator")),
		G.ref("Modifiers"),
		G.opt(G.val("async")),
		G.opt(G.val("*")),
		G.opt(G.field("accessor", G.choice(G.val("get"), G.val("set")))),
		G.field("name", PropertyKey),
		G.opt(G.val("?")),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.field("params", G.into("paren", G.sepBy(G.ref("Param"), G.val(",")))),
		G.opt(G.ref("TypeAnnotation")),
		G.choice(G.field("body", G.ref("Block")), G.val(";")),
	),
);

const ClassProperty: TRule = G.node(
	"PropertyDefinition",
	G.seq(
		G.many(G.ref("Decorator")),
		G.ref("Modifiers"),
		G.field("name", PropertyKey),
		G.opt(G.val("?")),
		G.opt(G.val("!")),
		G.opt(G.ref("TypeAnnotation")),
		G.opt(G.seq(G.val("="), G.field("value", G.ref("AssignmentExpr")))),
		G.opt(G.val(";")),
	),
);

const ClassMember: TRule = G.choice(StaticBlock, ClassConstructor, ClassMethod, ClassProperty);

const ClassBody: TRule = G.node("ClassBody", G.into("block", G.many(G.choice(ClassMember, G.val(";"), G.skip()))));

const EnumMember: TRule = G.node(
	"EnumMember",
	G.seq(G.field("name", G.choice(G.ref("IdentifierName"), G.tok("string"))), G.opt(G.seq(G.val("="), G.field("init", G.ref("AssignmentExpr"))))),
);

const DeclHead: TRule = G.seq(G.opt(G.field("doc", G.tok("jsdoc"))), G.many(G.ref("Decorator")), G.ref("Modifiers"));

const FunctionDecl: TRule = G.node(
	"Declaration",
	G.seq(
		DeclHead,
		G.field("kind", G.val("function")),
		G.opt(G.val("*")),
		G.field("name", G.tok("identifier")),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.field("params", G.into("paren", G.sepBy(G.ref("Param"), G.val(",")))),
		G.opt(G.ref("TypeAnnotation")),
		G.choice(G.field("body", G.ref("Block")), G.val(";")),
	),
);

const ClassDecl: TRule = G.node(
	"Declaration",
	G.seq(
		DeclHead,
		G.field("kind", G.val("class")),
		G.field("name", G.tok("identifier")),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.opt(HeritageExtends),
		G.opt(HeritageImplements),
		G.field("body", ClassBody),
	),
);

/** `export default class extends Base {}` — classe sem nome, só em posição de expressão/default export. */
const ClassExpr: TRule = G.node(
	"ClassExpr",
	G.seq(
		G.many(G.ref("Decorator")),
		G.val("class"),
		G.opt(G.field("name", G.tok("identifier"))),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.opt(HeritageExtends),
		G.opt(HeritageImplements),
		G.field("body", ClassBody),
	),
);

const InterfaceDecl: TRule = G.node(
	"Declaration",
	G.seq(
		DeclHead,
		G.field("kind", G.val("interface")),
		G.field("name", G.tok("identifier")),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.opt(HeritageExtendsList),
		G.field("body", G.into("block", G.ref("ObjectTypeMembers"))),
	),
);

const TypeAliasDecl: TRule = G.node(
	"Declaration",
	G.seq(
		DeclHead,
		G.field("kind", G.val("type")),
		G.field("name", G.tok("identifier")),
		G.opt(G.field("typeParams", G.ref("TypeParams"))),
		G.val("="),
		G.field("type", G.ref("Type")),
		G.opt(G.val(";")),
	),
);

const EnumDecl: TRule = G.node(
	"Declaration",
	G.seq(
		DeclHead,
		G.opt(G.val("const")),
		G.field("kind", G.val("enum")),
		G.field("name", G.tok("identifier")),
		G.field("body", G.into("block", G.sepBy(EnumMember, G.val(",")))),
	),
);

const NamespaceDecl: TRule = G.node(
	"Declaration",
	G.seq(
		DeclHead,
		G.field("kind", G.choice(G.val("namespace"), G.val("module"))),
		G.field("name", G.choice(G.ref("EntityName"), G.tok("string"))),
		G.field("body", G.ref("Block")),
	),
);

const VariableDecl: TRule = G.node(
	"Declaration",
	G.seq(
		G.opt(G.field("doc", G.tok("jsdoc"))),
		G.ref("Modifiers"),
		G.field("kind", G.choice(G.val("const"), G.val("let"), G.val("var"))),
		G.sepBy(G.field("declarators", G.ref("VariableDeclarator")), G.val(",")),
		G.opt(G.val(";")),
	),
);

const Declaration: TRule = G.choice(FunctionDecl, ClassDecl, InterfaceDecl, TypeAliasDecl, EnumDecl, NamespaceDecl, VariableDecl);

// ---------- import / export ----------

const ImportSpecifier: TRule = G.seq(
	G.opt(G.val("type")),
	G.field("name", G.ref("IdentifierName")),
	G.opt(G.seq(G.val("as"), G.field("local", G.tok("identifier")))),
);

const NamespaceImport: TRule = G.node("NamespaceImport", G.seq(G.val("*"), G.val("as"), G.field("local", G.tok("identifier"))));

const ImportClause: TRule = G.choice(
	G.seq(
		G.field("default", G.tok("identifier")),
		G.opt(G.seq(G.val(","), G.choice(G.field("namespace", NamespaceImport), G.into("block", G.sepBy(ImportSpecifier, G.val(",")))))),
	),
	G.field("namespace", NamespaceImport),
	G.into("block", G.sepBy(ImportSpecifier, G.val(","))),
);

const ImportDecl: TRule = G.node(
	"ImportDecl",
	G.choice(
		// import Foo = require("mod")
		G.seq(
			G.val("import"),
			G.field("name", G.tok("identifier")),
			G.val("="),
			G.val("require"),
			G.into("paren", G.field("source", G.tok("string"))),
			G.opt(G.val(";")),
		),
		G.seq(G.val("import"), G.opt(G.val("type")), ImportClause, G.val("from"), G.field("source", G.tok("string")), G.opt(G.val(";"))),
		// side-effect: import "mod"
		G.seq(G.val("import"), G.field("source", G.tok("string")), G.opt(G.val(";"))),
	),
);

const ExportClause: TRule = G.node(
	"ExportClause",
	G.seq(
		G.val("export"),
		G.opt(G.val("type")),
		G.into(
			"block",
			G.sepBy(
				G.seq(G.opt(G.val("type")), G.field("name", G.ref("IdentifierName")), G.opt(G.seq(G.val("as"), G.field("exported", G.ref("IdentifierName"))))),
				G.val(","),
			),
		),
		G.opt(G.seq(G.val("from"), G.field("source", G.tok("string")))),
		G.opt(G.val(";")),
	),
);

const ExportAllDecl: TRule = G.node(
	"ExportAllDecl",
	G.seq(
		G.val("export"),
		G.val("*"),
		G.opt(G.seq(G.val("as"), G.field("namespace", G.ref("IdentifierName")))),
		G.val("from"),
		G.field("source", G.tok("string")),
		G.opt(G.val(";")),
	),
);

const ExportAssignment: TRule = G.node("ExportAssignment", G.seq(G.val("export"), G.val("="), G.field("expr", G.ref("Expression")), G.opt(G.val(";"))));

/** `export default <expressão>` — as formas `export default function/class` já entram por `Declaration` (modifiers `export`+`default`). */
const ExportDefaultDecl: TRule = G.node(
	"ExportDefaultDecl",
	G.seq(G.val("export"), G.val("default"), G.field("value", G.ref("AssignmentExpr")), G.opt(G.val(";"))),
);

/** `declare global { … }` / `declare module "x" { … }` — efeito colateral, corpo não desce como declaração. */
const SideEffect: TRule = G.node(
	"SideEffect",
	G.seq(G.val("declare"), G.choice(G.val("global"), G.seq(G.val("module"), G.tok("string"))), G.placeholder("block")),
);

const File: TRule = G.many(
	G.choice(
		SideEffect,
		ExportAllDecl,
		ExportAssignment,
		ExportDefaultDecl,
		ExportClause,
		ImportDecl,
		Declaration,
		G.ref("Statement"),
		G.skip(),
	),
);

const DECL_RULES: Record<string, TRule> = {
	File,
	Declaration,
	FunctionDecl,
	ClassDecl,
	ClassExpr,
	InterfaceDecl,
	TypeAliasDecl,
	EnumDecl,
	NamespaceDecl,
	VariableDecl,
	ImportDecl,
	ExportClause,
	ExportAllDecl,
	ExportAssignment,
	ExportDefaultDecl,
	SideEffect,
};

export { DECL_RULES };
