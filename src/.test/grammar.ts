import { tsLang } from "@ts/ast/ts/declarations";
import { Lexer } from "@ts/lexer-v2/model";

console.clear()

const lexer = new Lexer()
	
lexer.rules.set(tsLang)

lexer.test();