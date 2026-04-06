import { isNull } from "@ts/implementations";
import { BPSearch } from "./BPSearch";
import { SPSearch } from "./SPSearch";
import { FragmentedPattern, Pattern, RawFragmentedPattern } from "./types";

class RawPatternResolver {
	spSearch = new SPSearch();
	escapeAt = -1

	scopes: RawFragmentedPattern[] = [];
	root: FragmentedPattern = {
		id: '_root',
		content: [],
	}
	pattern: FragmentedPattern = {
		id: '_pattern',
		content: [],
	}

	onEscape(pattern:string, i: number) {
		this.escapeAt = i+1;
	}

	onOpen(pattern:string, i: number) {
		if (this.escapeAt === i) {
			this.escapeAt = -1;
			return;
		}
		if (this.scopes.length && (this.scopes[this.scopes.length-1].divisor||0) > 1) {
			throw new Error('Can\'t make a pattern in quantity part!');
		}
		this.scopes.push({
			content: [],
			divisor: 0,
		})
	}

	onClose(pattern:string, i: number) {
		if (this.escapeAt === i) {
			this.escapeAt = -1;
			return;
		}
		const scope = this.scopes.pop();
		if (!scope) throw new Error('Unmatched parenthesis at position ' + i);
		if (scope.divisor == 2) {
			scope.quantity = scope.content.pop() as string;
		}
		delete scope.divisor;
		if (this.scopes.length) {
			this.scopes[this.scopes.length-1].content.push(scope);
		} else {
			this.pattern.content.push(scope as FragmentedPattern);
		}
	}

	getScope() {
		return this.scopes.length ? this.scopes[this.scopes.length-1] : this.pattern;
	}

	getTarget() {
		return this.getScope().content;
	}

	onMismatch(chars:string, i: number) {
		const target = this.getTarget();
		target.push(chars);
	}

	isRoot(scope: RawFragmentedPattern|FragmentedPattern): scope is FragmentedPattern {
		return scope == this.pattern;
	}

	onPart(pattern:string, i: number) {
		if (this.escapeAt === i) {
			this.escapeAt = -1;
			return;
		}
		const scope = this.getScope();
		if (this.isRoot(scope)) return;
		if (isNull(scope.divisor)) throw new Error('Something unkown happened!');

		scope.divisor += 1;
		if (scope.divisor == 2) return;
		let last = scope.content.pop()!;
		if (typeof last != 'string') throw new Error('Modifier/Quantity cant\' be a pattern');
		if (scope.divisor > 2) throw new Error('Only 2 parts are allowed in a pattern');
		if (scope.divisor == 1) {
			scope.modifier = last;
		}
	}

	constructor() {
		this.spSearch.onMismatch = this.onMismatch.bind(this);
		this.spSearch.addPatterns({
			"\\": this.onEscape.bind(this),
			"(": this.onOpen.bind(this),
			")": this.onClose.bind(this),
			"/": this.onPart.bind(this),
		})
	}
}

export class APSearch extends BPSearch<Pattern> {


	private resolvePatterns() {
		const Scope = new RawPatternResolver();
		for (const pattern in this.callbacks) {
			Scope.spSearch.content = pattern;
			Scope.spSearch.resolve();
			Scope.pattern.id = this.callbacks[pattern].id;
			Scope.root.content.push(Scope.pattern);
			Scope.pattern = {
				id: '_pattern',
				content: [],
			};
		}
		return Scope.root;
	}

	resolve() {
		const result = this.resolvePatterns();
		console.log('APSearch resolve result:', JSON.stringify(result, null, 2));
	}
}
