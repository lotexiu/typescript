import { TOnPatternFound, TPatternHandlers } from "./types";

export abstract class BPSearch<T = TOnPatternFound> {
	protected callbacks: TPatternHandlers<T> = {};
	protected dirty = false;

	content: string = "";

	addPatterns(patterns: TPatternHandlers<T>) {
		for (const pattern in patterns) {
			if (!(pattern in this.callbacks)) {
				this.dirty = true;
			}
			this.callbacks[pattern] = patterns[pattern];
		}
	}

	removePatterns(patterns: string[]) {
		for (const pattern of patterns) {
			delete this.callbacks[pattern];
		}
		this.dirty = true;
	}

	cleanPatterns() {
		this.callbacks = {} as TPatternHandlers<T>;
		this.dirty = true;
	}

	getPatterns() {
		return {...this.callbacks};
	}


	abstract resolve(): void;
}
