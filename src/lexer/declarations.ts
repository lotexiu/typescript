import { StringUtils } from "@tsn-string/utils";
import { TTokenRule } from "./types";

const {
	WHITESPACE_CODE,
	NEWLINE_CODE,
	CARRIAGE_RETURN_CODE,
	TAB_CODE,
} = StringUtils;

const LEXER_BASIC_RULES = {
	space: {
		type: 'charClass',
		kind: 'space',
		test(code) { return code === WHITESPACE_CODE || code === CARRIAGE_RETURN_CODE || code === TAB_CODE },
		continueTest(code) { return code === WHITESPACE_CODE || code === CARRIAGE_RETURN_CODE || code === TAB_CODE },
		trivia: true,
	},
	newline: {
		type: 'charClass',
		kind: 'newline',
		test(code) { return code === NEWLINE_CODE }
	},
} satisfies Record<string, TTokenRule>;

export {
	LEXER_BASIC_RULES,
}