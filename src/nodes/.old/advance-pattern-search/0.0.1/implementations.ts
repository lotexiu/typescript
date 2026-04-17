import { _String } from "@tsn-string/generic/implementations";
import {
	TPatternModifierKey,
	TPatternModifierState,
	TPatternNode,
	TPatternQuantity,
} from "./types";

const negate = (matcher: (char: string) => boolean) => (char: string) => !matcher(char);

/* TODO
- criar codigo dos modificadores
- criar codigo da quantidade
*/

/* Apenas um exemplo ficticio pois ainda não sei como devo imeplemtar exatamente os modicadores ainda.
export const MODIFIERS = { // Modificadores. mudam o comportamento do conteudo central
	s: 1, // Set
	i: 1, // Case-insensitive
	l: 1, // Literal
	$: 1, // End of string
	r: 1, // Recursive
	'^': 1, // Start of string
	'!': 1, // Negate
	'@': 1,// Referência a um pattern

	'<': 1, // LookBehind
	'<:': 1, // LookBehind com captura
	'<!': 1, // LookBehind negativo

	'>': 1, // LookAhead
	'>:': 1, // LookAhead com captura
	'>!': 1, // LookAhead negativo
}
 */
export const EXR = { // Todos os tipos abaixo são validações de um único caractere.
	/* Letras e Números */
	w: _String.isIdentifier,
	W: negate(_String.isIdentifier),

	/* Letras */
	a: _String.isLetter,
	A: negate(_String.isLetter),
	l: _String.isLowerCase,
	L: negate(_String.isLowerCase),
	u: _String.isUpperCase,
	U: negate(_String.isUpperCase),

	/* Numéricos */
	d: _String.isDigit,
	D: negate(_String.isDigit),
	h: _String.isHexadecimal,
	H: negate(_String.isHexadecimal),

	/* Estruturais */
	g: _String.isFormatting,
	G: negate(_String.isFormatting),
	s: _String.isWhitespace,
	S: negate(_String.isWhitespace),
	b: _String.isLineBreak,
	B: negate(_String.isLineBreak),
	t: _String.isTab,
	T: negate(_String.isTab),
	r: _String.isCarriageReturn,
	R: negate(_String.isCarriageReturn),
	f: _String.isFormFeed,
	F: negate(_String.isFormFeed),
	v: _String.isVerticalTab,
	V: negate(_String.isVerticalTab),

	/* Simbólicos */
	y: _String.isSymbol,
	Y: negate(_String.isSymbol),
	x: _String.isMathOperator,
	X: negate(_String.isMathOperator),
	p: _String.isPunctuation,
	P: negate(_String.isPunctuation),

	/* Outros */
	e: _String.isEscape,
	E: negate(_String.isEscape),
	'*': ()=>true, // anything
	m: (char: string) => char in EXR,
	M: (char: string) => !(char in EXR),
};

export const MODIFIERS: Record<TPatternModifierKey, { mode?: TPatternModifierState['mode']; supported: boolean }> = {
	i: { supported: true },
	l: { mode: 'literal', supported: true },
	s: { mode: 'set', supported: true },
	'!': { supported: true },
	':': { supported: true },
	'<': { supported: true },
	'>': { supported: true },
	'@': { mode: 'reference', supported: true },
	R: { supported: false },
};

export const QUANTITY = {
	'*': [0, Infinity],
	'+': [1, Infinity],
	'?': [0, 1],
} as const satisfies Record<string, TPatternQuantity>;

export function createSequenceNode(nodes: TPatternNode[]): TPatternNode {
	const normalized = nodes.flatMap((node) => {
		if (node.kind === 'empty') return [];
		if (node.kind === 'sequence') return node.nodes;
		return [node];
	});

	if (!normalized.length) return { kind: 'empty' };
	if (normalized.length === 1) return normalized[0];
	return {
		kind: 'sequence',
		nodes: normalized,
	};
}

export function createAlternationNode(branches: TPatternNode[]): TPatternNode {
	const normalized = branches.flatMap((branch) => {
		if (branch.kind === 'alternation') return branch.branches;
		return [branch];
	});

	if (!normalized.length) return { kind: 'empty' };
	if (normalized.length === 1) return normalized[0];
	return {
		kind: 'alternation',
		branches: normalized,
	};
}

export function normalizePatternQuantity(raw?: string): TPatternQuantity {
	if (!raw?.length) return [1, 1];
	if (raw in QUANTITY) return QUANTITY[raw as keyof typeof QUANTITY];

	if (/^-?\d+$/.test(raw)) {
		const value = Number(raw);
		if (!Number.isInteger(value) || value <= 0) {
			throw new Error(`Invalid quantity "${raw}". Quantity must be greater than zero.`);
		}
		return [value, value];
	}

	if (/^-?\d+,-?\d+$/.test(raw)) {
		const [rawMin, rawMax] = raw.split(',');
		const min = Number(rawMin);
		const max = Number(rawMax);

		if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max <= 0) {
			throw new Error(`Invalid quantity "${raw}". Range values must be greater than zero.`);
		}

		if (min > max) {
			throw new Error(`Invalid quantity "${raw}". Min value cannot be greater than max value.`);
		}

		return [min, max];
	}

	throw new Error(`Invalid quantity "${raw}".`);
}

export function parsePatternModifiers(raw: string): TPatternModifierState {
	let mode: TPatternModifierState['mode'] = 'default';
	const keys: TPatternModifierKey[] = [];
	let negate = false;
	let lookaround: TPatternModifierState['lookaround'];
	let negativeLookaround = false;
	let capture = false;
	let reference = false;
	let previousKey: TPatternModifierKey | undefined;

	for (let index = 0; index < raw.length; index++) {
		const char = raw[index];
		if (!(char in MODIFIERS)) {
			throw new Error(`Unknown modifier "${char}".`);
		}

		const key = char as TPatternModifierKey;
		const config = MODIFIERS[key];
		if (!config.supported) {
			throw new Error(`Modifier "${char}" is not implemented yet.`);
		}

		if (key === '!') {
			const nextKey = raw[index + 1] as TPatternModifierKey | undefined;

			if (previousKey && previousKey !== '!' && previousKey !== '<' && previousKey !== '>') {
				throw new Error(`Modifier "!" cannot be applied after "${previousKey}".`);
			}

			if ((nextKey === '<' || nextKey === '>') && !lookaround) {
				negativeLookaround = !negativeLookaround;
				keys.push(key);
				previousKey = key;
				continue;
			}

			negate = !negate;
			keys.push(key);
			previousKey = key;
			continue;
		}

		if (key === '<' || key === '>') {
			if (lookaround) {
				throw new Error(`Modifiers "${raw}" cannot define multiple lookarounds.`);
			}

			lookaround = key === '>' ? 'ahead' : 'behind';
			keys.push(key);
			previousKey = key;
			continue;
		}

		if (key === ':') {
			capture = true;
			keys.push(key);
			previousKey = key;
			continue;
		}

		if (key === '@') {
			reference = true;
		}

		if (config.mode) {
			if (mode !== 'default' && mode !== config.mode) {
				throw new Error(`Modifiers "${raw}" cannot combine multiple content modes.`);
			}
			mode = config.mode;
		}

		if (!keys.includes(key)) {
			keys.push(key);
		}

		previousKey = key;
	}

	return {
		raw,
		keys,
		mode,
		insensitive: keys.includes('i'),
		negate,
		lookaround,
		negativeLookaround,
		capture,
		reference,
	};
}

export function applyInsensitive(node: TPatternNode): TPatternNode {
	switch (node.kind) {
		case 'literal':
			return {
				...node,
				insensitive: true,
			};
		case 'expression':
			return {
				...node,
				insensitive: true,
			};
		case 'set':
			return {
				...node,
				insensitive: true,
			};
		case 'sequence':
			return {
				kind: 'sequence',
				nodes: node.nodes.map(applyInsensitive),
			};
		case 'alternation':
			return {
				kind: 'alternation',
				branches: node.branches.map(applyInsensitive),
			};
		case 'repeat':
			return {
				kind: 'repeat',
				node: applyInsensitive(node.node),
				quantity: node.quantity,
			};
		case 'not':
			return {
				kind: 'not',
				node: applyInsensitive(node.node),
			};
		case 'assertion':
			return {
				kind: 'assertion',
				direction: node.direction,
				negative: node.negative,
				node: applyInsensitive(node.node),
			};
		case 'capture':
			return {
				kind: 'capture',
				name: node.name,
				node: applyInsensitive(node.node),
			};
		default:
			return node;
	}
}

export function getPatternNodeMinLength(node: TPatternNode): number {
	switch (node.kind) {
		case 'empty':
			return 0;
		case 'literal':
			return node.value.length;
		case 'expression':
		case 'set':
			return 1;
		case 'sequence':
			return node.nodes.reduce((total, current) => total + getPatternNodeMinLength(current), 0);
		case 'alternation':
			return node.branches.reduce((smallest, current) => {
				const currentLength = getPatternNodeMinLength(current);
				return Math.min(smallest, currentLength);
			}, Infinity);
		case 'repeat':
			return getPatternNodeMinLength(node.node) * node.quantity[0];
		case 'not':
			return 1;
		case 'assertion':
			return 0;
		case 'reference':
			return 0;
		case 'capture':
			return getPatternNodeMinLength(node.node);
	}
}

export function matchExpressionChar(expression: string, char: string, insensitive = false): boolean {
	const normalizedChar = insensitive ? char.toLowerCase() : char;
	const key = insensitive ? expression.toLowerCase() : expression;
	const matcher = EXR[key as keyof typeof EXR];

	if (matcher) return matcher(normalizedChar);
	if (!insensitive) return expression === char;
	return expression.toLowerCase() === char.toLowerCase();
}

/* Exemplo ficticio. Ainda não sei como deveria estar criando QUANTITY, mas seria algo do tipo:
EXPORT CONST QUANTITY = {
	'*': { MIN: 0, MAX: INFINITY },
	'+': { MIN: 1, MAX: INFINITY },
	'?': { MIN: 0, MAX: 1 },
}
 */

/* Modelo de Sintaxe mais apoiado. Que as pessoas mais gostaram
	(Modificador/Centro/Quantidade)
	(i/a/3) 			-> Insensitive, Letra, 3 vezes.
	(L/abc|def/+)	-> Literal, "abc" OU "def", uma ou mais vezes.
*/
