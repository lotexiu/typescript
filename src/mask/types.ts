
type TMaskRule = {
	match: string[];
	flags?: string;
}

type TMaskToken =
	| { type: 'mask', value: string }
	| { type: 'rule', value: string, min: number, max: number, flags?: string, test: RegExp }

type TMaskCompiledPattern = {
	source: string
	tokens: TMaskToken[]
}

export {
	TMaskRule,
	TMaskToken,
	TMaskCompiledPattern
}