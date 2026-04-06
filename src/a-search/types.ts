import { TNullable } from "@ts/types";

export type OnMismatch = (chars: string, index: number, patternsToBeTriggered: string[]) => void;
export type OnPatternFound = (pattern: string, index: number) => void;

export type PatternHandlers<T = OnPatternFound> = Record<string, T>;

export type Pattern = {
	id: string;
	call: OnPatternFound;
}

export type FragmentedPattern = {
	id: string;
	content: (string|FragmentedPattern)[];
	modifiers?: string[];
	quantity?: [number, number] | 1;
}

export type RawFragmentedPattern = {
	content: (string|RawFragmentedPattern)[];
	divisor?: number;
	modifier?: string;
	quantity?: string;
}
