export type TOnMismatch = (chars: string, index: number, patternsToBeTriggered: string[]) => void;
export type TOnPatternFound = (value: string, index: number, pattern: string) => void;

export type TPatternHandlers<T = TOnPatternFound> = Record<string, T>;

export type TPattern = {
	id: string;
	call: TOnPatternFound;
};

export type TPatternQuantity = readonly [number, number];
export type TPatternParserMode = 'default' | 'literal' | 'set' | 'reference';
export type TPatternModifierKey = 'i' | 'l' | 's' | '!' | ':' | '<' | '>' | '@' | 'R';

export type TPatternModifierState = {
	raw: string;
	keys: TPatternModifierKey[];
	mode: TPatternParserMode;
	insensitive: boolean;
	negate: boolean;
	lookaround?: 'ahead' | 'behind';
	negativeLookaround: boolean;
	capture: boolean;
	reference: boolean;
};

export type TPatternNode =
	| {
		kind: 'empty';
	}
	| {
		kind: 'literal';
		value: string;
		insensitive?: boolean;
	}
	| {
		kind: 'expression';
		expression: string;
		insensitive?: boolean;
	}
	| {
		kind: 'set';
		members: string[];
		insensitive?: boolean;
	}
	| {
		kind: 'sequence';
		nodes: TPatternNode[];
	}
	| {
		kind: 'alternation';
		branches: TPatternNode[];
	}
	| {
		kind: 'repeat';
		node: TPatternNode;
		quantity: TPatternQuantity;
	}
	| {
		kind: 'not';
		node: TPatternNode;
	}
	| {
		kind: 'assertion';
		direction: 'ahead' | 'behind';
		negative?: boolean;
		node: TPatternNode;
	}
	| {
		kind: 'reference';
		patternId: string;
	}
	| {
		kind: 'capture';
		name: string;
		node: TPatternNode;
	};

export type TPatternParseError = {
	message: string;
	index: number;
	pattern: string;
};

export type TPatternMatch = {
	id: string;
	pattern: string;
	index: number;
	length: number;
	value: string;
};

export type TPatternCapture = {
	name: string;
	index: number;
	length: number;
	value: string;
};

export type TPatternCapturedMatch = {
	id: string;
	pattern: string;
	index: number;
	length: number;
	value: string;
	groups: Record<string, string[]>;
	captures: TPatternCapture[];
};

export type TCompiledPattern = {
	id: string;
	source: string;
	pattern: TPattern;
	ast: TPatternNode;
	minLength: number;
};

export type FragmentedPattern = {
	id: string;
	content: (string | FragmentedPattern)[];
	modifiers?: string[];
	quantity?: TPatternQuantity | 1;
};

export type RawFragmentedPattern = {
	content: (string | RawFragmentedPattern)[];
	divisor?: number;
	modifier?: string;
	quantity?: string;
};

export type OnMismatch = TOnMismatch;
export type OnPatternFound = TOnPatternFound;
export type PatternHandlers<T = TOnPatternFound> = TPatternHandlers<T>;
export type Pattern = TPattern;
