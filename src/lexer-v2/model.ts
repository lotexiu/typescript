import { AhoCorasick } from "@ts/aho-corasick-v2/model";
import { computed } from "@ts/computed/model";
import { model } from "@ts/model/model";
import { Parser } from "@ts/parser-v2/model";

const text = `/* Comment */
/** Docs */
// Hello word! {}
function test() {}
{const a = 1}`;

type TDelimiter = {
	open: string;
	close: string;
};

type TRule = {
	scope: Record<string, TDelimiter>;
	delimited: Record<string, TDelimiter | readonly TDelimiter[]>;
	literal: Record<string, readonly string[]>;
};

class Lexer {
	readonly rules = model<TRule | null>(null);

	readonly tokens = computed(() => {
		if (!this.rules.value) return [];
		const { delimited, literal, scope } = this.rules.value;
		const tokens: any[] = [];
		Object.entries(scope).forEach(([type, { open, close }]) =>
			tokens.push({ kind: "scope", type, value: open }, { kind: "scope", type, value: close }),
		);
		Object.entries(delimited).forEach(([type, value]) =>
			value instanceof Array ?
				value.forEach(({ open, close }) =>
					tokens.push({ kind: "delimited", type, value: open }, { kind: "delimited", type, value: close }),
				)
			:	tokens.push({ kind: "delimited", type, value: value.open }, { kind: "delimited", type, value: value.close }),
		);
		Object.entries(literal).forEach(([type, values]) => values.map((value) => tokens.push({ kind: "literal", type, value })));
		return tokens;
	}, [this.rules]);

	readonly ahoCorasick = computed(() => {
		return AhoCorasick.compile(...this.tokens.value.map((v)=>v.value));
	}, [this.tokens]);

	constructor() {}

	test() {
		this.ahoCorasick.value
		// this.ahoCorasick.value.scan(text, {
		// 	onMatch: (id, start) => {
		// 		console.log(this.tokens.value[id], start);
		// 	},
		// });
	}
}

export { Lexer };
