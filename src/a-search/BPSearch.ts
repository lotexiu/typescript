import { OnPatternFound, PatternHandlers } from "./types";

export abstract class BPSearch<T = OnPatternFound> {
	protected callbacks: PatternHandlers<T> = {};
	protected dirty = false;

	content: string = "";

	addPatterns(patterns: PatternHandlers<T>) {
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
		this.callbacks = {} as PatternHandlers<T>;
		this.dirty = true;
	}

	getPatterns() {
		return {...this.callbacks};
	}


	abstract resolve(): void;
}
