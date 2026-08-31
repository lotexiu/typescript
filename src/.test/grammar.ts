import { Grammar } from "@ts/ast/grammar/model";
import { GrammarUtils } from "@ts/ast/grammar/utils";
import { Lexer } from "@ts/lexer/model";
import { readFileSync } from "fs";

// const text = readFileSync('src/natives/string/implementations.ts', 'utf8')
const text = readFileSync("src/index.ts", "utf8");

const lexer = new Lexer();
lexer.escape = "\\";
lexer.text.set(text);
lexer.addRules(
	{...Lexer.basicRules.space},
	{...Lexer.basicRules.newline},
	{
		type: "literal",
		kind: "keyword",
		values: [
			"export",
			"default",
			"declare",
			"abstract",
			"class",
			"interface",
			"type",
			"function",
			"const",
			"let",
			"var",
			"enum",
			"namespace",
			"extends",
			"implements",
		],
	},
);

const counter = {} as Record<string, number>;
lexer.tokens.forEach((token) => (counter[token.kind] = (counter[token.kind] ?? 0) + 1));
console.log(counter);

const { node, kindVal, tok, val, choice, seq, many, anyToken, ref } = GrammarUtils;
const grammar = new Grammar();

const ast = grammar
	.rule("export", node("ExportType", seq(kindVal("keyword", "export"), kindVal("keyword", "type"))))
	.rule("root", many(choice(ref("export"), anyToken())))
	.start("root")
	.parse(lexer.tokens, text, lexer.triviaKinds);

console.log(`${ast.children.length} "export type" encontrados:`);
// for (const child of ast.children) console.log(`  ${child.start}-${child.end}: ${text.slice(child.start, child.end)}`);
