import { BPSearch } from "./BPSearch";
import {
	EXR,
	applyInsensitive,
	createAlternationNode,
	createSequenceNode,
	getPatternNodeMinLength,
	matchExpressionChar,
	normalizePatternQuantity,
	parsePatternModifiers,
} from "./implementations";
import {
	TCompiledPattern,
	TPatternCapture,
	TPatternCapturedMatch,
	TPattern,
	TPatternMatch,
	TPatternNode,
	TPatternParserMode,
} from "./types";

/* TODO
	Criar um codigo que ira ler os patterns qual são expressões avançadas como o Regex
	e transformar em nodos para o algoritmo de busca semelhante ao SPSearch (Tipo de versão do Aho-Corasick)
	Como os nodos seriam talvez seja algo como:
	PatternNode {
		test: (char) => boolean, // função para testar se o char bate com o nodo
		next: PatternNode[], // O que vem depois (pode ser multiplos por causa de |)
		quantity: [min, max], // Quantidade de vezes que o nodo deve se repetir (pode ser infinito)
		modifier: ... // lookaround, negate, etc (Todos cujo podem estar ou ser adicionados em MODIFIERS)
	}

	Precisa ser visto melhor como os nodos irão ser como também realizar a criação do QUANTITY e MODIFIERS, com base como esses nodos funcionaram ou o oposto.
	Mas acredito que as constantes quantity e modifiers em implementations.ts serão semelhantes a constante EXR.
*/

type TGroupParts = {
	modifier: string;
	content: string;
	quantity?: string;
};

type TParseContext = {
	nextCaptureIndex: number;
};

type TMatchState = {
	end: number;
	captures: TPatternCapture[];
};

function unescapeLiteral(value: string) {
	let result = '';

	for (let index = 0; index < value.length; index++) {
		const char = value[index];
		if (char !== '\\') {
			result += char;
			continue;
		}

		index += 1;
		if (index >= value.length) {
			throw new Error('Pattern cannot end with a dangling escape character.');
		}

		result += value[index];
	}

	return result;
}

function splitTopLevel(value: string, separator: '/' | '|') {
	const parts: string[] = [];
	let current = '';
	let depth = 0;
	let escaped = false;

	for (const char of value) {
		if (escaped) {
			current += `\\${char}`;
			escaped = false;
			continue;
		}

		if (char === '\\') {
			escaped = true;
			continue;
		}

		if (char === '(') depth += 1;
		if (char === ')') depth -= 1;

		if (depth < 0) {
			throw new Error('Unmatched closing parenthesis.');
		}

		if (!depth && char === separator) {
			parts.push(current);
			current = '';
			continue;
		}

		current += char;
	}

	if (escaped) {
		throw new Error('Pattern cannot end with a dangling escape character.');
	}

	parts.push(current);
	return parts;
}

function readGroup(value: string, start: number) {
	let depth = 0;
	let escaped = false;

	for (let index = start; index < value.length; index++) {
		const char = value[index];

		if (escaped) {
			escaped = false;
			continue;
		}

		if (char === '\\') {
			escaped = true;
			continue;
		}

		if (char === '(') depth += 1;
		if (char === ')') depth -= 1;

		if (!depth) {
			return {
				end: index,
				content: value.slice(start + 1, index),
			};
		}
	}

	throw new Error('Unmatched opening parenthesis.');
}

function parseGroupParts(value: string): TGroupParts {
	const parts = splitTopLevel(value, '/');
	if (parts.length === 1) {
		return {
			modifier: '',
			content: parts[0],
		};
	}

	if (parts.length === 2) {
		return {
			modifier: parts[0],
			content: parts[1],
		};
	}

	if (parts.length === 3) {
		return {
			modifier: parts[0],
			content: parts[1],
			quantity: parts[2],
		};
	}

	throw new Error('A group can only contain modifier, content and quantity parts.');
}

function parseDefaultText(value: string): TPatternNode[] {
	const nodes: TPatternNode[] = [];
	let literal = '';

	const flushLiteral = () => {
		if (!literal.length) return;
		nodes.push({
			kind: 'literal',
			value: literal,
		});
		literal = '';
	};

	for (let index = 0; index < value.length; index++) {
		const char = value[index];

		if (char === '\\') {
			index += 1;
			if (index >= value.length) {
				throw new Error('Pattern cannot end with a dangling escape character.');
			}
			literal += value[index];
			continue;
		}

		if (char in EXR) {
			flushLiteral();
			nodes.push({
				kind: 'expression',
				expression: char,
			});
			continue;
		}

		literal += char;
	}

	flushLiteral();
	return nodes;
}

function parseSetText(value: string): TPatternNode {
	const members: string[] = [];

	for (let index = 0; index < value.length; index++) {
		const char = value[index];
		if (char !== '\\') {
			members.push(char);
			continue;
		}

		index += 1;
		if (index >= value.length) {
			throw new Error('Pattern cannot end with a dangling escape character.');
		}
		members.push(value[index]);
	}

	return {
		kind: 'set',
		members: [...new Set(members)],
	};
}

function parseTextByMode(value: string, mode: TPatternParserMode): TPatternNode[] {
	if (!value.length) return [];
	if (mode === 'reference') {
		return [{
			kind: 'reference',
			patternId: unescapeLiteral(value),
		}];
	}

	if (mode === 'literal') {
		return [{
			kind: 'literal',
			value: unescapeLiteral(value),
		}];
	}

	if (mode === 'set') {
		return [parseSetText(value)];
	}

	return parseDefaultText(value);
}

function parseSequence(value: string, mode: TPatternParserMode, context: TParseContext): TPatternNode {
	const nodes: TPatternNode[] = [];
	let textStart = 0;

	const flushText = (end: number) => {
		const raw = value.slice(textStart, end);
		nodes.push(...parseTextByMode(raw, mode));
	};

	for (let index = 0; index < value.length; index++) {
		const char = value[index];
		if (char === '\\') {
			index += 1;
			continue;
		}

		if (char !== '(') continue;

		if (mode === 'set') {
			throw new Error('Set groups do not support nested patterns.');
		}

		if (mode === 'reference') {
			throw new Error('Reference groups do not support nested patterns.');
		}

		flushText(index);
		const group = readGroup(value, index);
		nodes.push(parseGroup(group.content, context));
		index = group.end;
		textStart = index + 1;
	}

	flushText(value.length);
	return createSequenceNode(nodes);
}

function parseAlternation(value: string, mode: TPatternParserMode, context: TParseContext): TPatternNode {
	const branches = splitTopLevel(value, '|').map((branch) => parseSequence(branch, mode, context));
	return createAlternationNode(branches);
}

function parseGroup(value: string, context: TParseContext): TPatternNode {
	const parts = parseGroupParts(value);
	const modifiers = parsePatternModifiers(parts.modifier);

	if (modifiers.capture && modifiers.lookaround) {
		throw new Error('Capture groups cannot be combined with lookaround assertions.');
	}

	if (modifiers.reference && (modifiers.insensitive || modifiers.negate || modifiers.lookaround || modifiers.mode !== 'reference')) {
		throw new Error(`Modifiers "${parts.modifier}" cannot combine reference with other content modifiers.`);
	}

	let node = parseAlternation(parts.content, modifiers.mode, context);

	if (modifiers.insensitive) {
		node = applyInsensitive(node);
	}

	if (modifiers.negate) {
		node = {
			kind: 'not',
			node,
		};
	}

	if (modifiers.lookaround) {
		node = {
			kind: 'assertion',
			direction: modifiers.lookaround,
			negative: modifiers.negativeLookaround,
			node,
		};
	}

	if (modifiers.capture) {
		node = {
			kind: 'capture',
			name: `group${context.nextCaptureIndex}`,
			node,
		};
		context.nextCaptureIndex += 1;
	}

	const quantity = normalizePatternQuantity(parts.quantity);
	if (modifiers.lookaround && (quantity[0] !== 1 || quantity[1] !== 1)) {
		throw new Error('Lookaround assertions cannot be quantified.');
	}

	if (quantity[0] === 1 && quantity[1] === 1) {
		return node;
	}

	return {
		kind: 'repeat',
		node,
		quantity,
	};
}

export function parseAPSearchPattern(pattern: string): TPatternNode {
	return parseAlternation(pattern, 'literal', { nextCaptureIndex: 1 });
}

function pushUnique(target: number[], values: number[]) {
	for (const value of values) {
		if (!target.includes(value)) {
			target.push(value);
		}
	}
	return target;
}

function sortDescending(values: number[]) {
	return [...values].sort((left, right) => right - left);
}

function mergeCaptures(left: TPatternCapture[], right: TPatternCapture[]) {
	return [...left, ...right].sort((a, b) => a.index - b.index || a.name.localeCompare(b.name));
}

function pushUniqueMatches(target: TMatchState[], values: TMatchState[]) {
	for (const value of values) {
		const existing = target.find((item) => item.end === value.end && JSON.stringify(item.captures) === JSON.stringify(value.captures));
		if (!existing) {
			target.push(value);
		}
	}
	return target;
}

function sortMatchStatesDescending(values: TMatchState[]) {
	return [...values].sort((left, right) => right.end - left.end);
}

function collectReferenceIds(node: TPatternNode, target: Set<string>) {
	switch (node.kind) {
		case 'sequence':
			for (const child of node.nodes) collectReferenceIds(child, target);
			return target;
		case 'alternation':
			for (const child of node.branches) collectReferenceIds(child, target);
			return target;
		case 'repeat':
		case 'not':
		case 'capture':
		case 'assertion':
			collectReferenceIds(node.node, target);
			return target;
		case 'reference':
			target.add(node.patternId);
			return target;
		default:
			return target;
	}
}

function groupCaptures(captures: TPatternCapture[]) {
	return captures.reduce<Record<string, string[]>>((groups, capture) => {
		groups[capture.name] ??= [];
		groups[capture.name].push(capture.value);
		return groups;
	}, {});
}

export class APSearch extends BPSearch<TPattern> {
	private compiledPatterns: TCompiledPattern[] = [];
	private compiledPatternsById = new Map<string, TCompiledPattern>();
	matches: TPatternMatch[] = [];
	captures: TPatternCapturedMatch[] = [];

	static parse(pattern: string) {
		return parseAPSearchPattern(pattern);
	}

	private compilePatterns() {
		if (!this.dirty) return;
		this.dirty = false;

		this.compiledPatterns = Object.entries(this.callbacks).map(([source, pattern]) => {
			let ast: TPatternNode;
			try {
				ast = parseAPSearchPattern(source);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				throw new Error(`Failed to compile pattern "${source}": ${message}`);
			}
			return {
				id: pattern.id,
				source,
				pattern,
				ast,
				minLength: getPatternNodeMinLength(ast),
			};
		});

		this.compiledPatternsById = new Map(this.compiledPatterns.map((pattern) => [pattern.id, pattern]));

		for (const compiled of this.compiledPatterns) {
			for (const referenceId of collectReferenceIds(compiled.ast, new Set<string>())) {
				if (!this.compiledPatternsById.has(referenceId)) {
					throw new Error(`Failed to compile pattern "${compiled.source}": Unknown referenced pattern id "${referenceId}".`);
				}
			}
		}

		const visiting = new Set<string>();
		const visited = new Set<string>();
		const validate = (compiled: TCompiledPattern) => {
			if (visited.has(compiled.id)) return;
			if (visiting.has(compiled.id)) {
				throw new Error(`Failed to compile pattern "${compiled.source}": Cyclic references are not implemented yet.`);
			}

			visiting.add(compiled.id);
			for (const referenceId of collectReferenceIds(compiled.ast, new Set<string>())) {
				validate(this.compiledPatternsById.get(referenceId)!);
			}
			visiting.delete(compiled.id);
			visited.add(compiled.id);
		};

		for (const compiled of this.compiledPatterns) {
			validate(compiled);
		}
	}

	private matchNode(
		node: TPatternNode,
		index: number,
		cache: WeakMap<TPatternNode, Map<number, TMatchState[]>>,
		referenceStack: string[] = [],
	): TMatchState[] {
		let nodeCache = cache.get(node);
		if (!nodeCache) {
			nodeCache = new Map<number, TMatchState[]>();
			cache.set(node, nodeCache);
		}

		const cached = nodeCache.get(index);
		if (cached) return cached;

		let results: TMatchState[];
		switch (node.kind) {
			case 'empty':
				results = [{ end: index, captures: [] }];
				break;
			case 'literal': {
				const slice = this.content.slice(index, index + node.value.length);
				const left = node.insensitive ? slice.toLowerCase() : slice;
				const right = node.insensitive ? node.value.toLowerCase() : node.value;
				results = left === right ? [{ end: index + node.value.length, captures: [] }] : [];
				break;
			}
			case 'expression':
				results = index < this.content.length && matchExpressionChar(node.expression, this.content[index], node.insensitive)
					? [{ end: index + 1, captures: [] }]
					: [];
				break;
			case 'set':
				results = index < this.content.length && node.members.some((member) => matchExpressionChar(member, this.content[index], node.insensitive))
					? [{ end: index + 1, captures: [] }]
					: [];
				break;
			case 'alternation':
				results = node.branches.reduce<TMatchState[]>((all, branch) => pushUniqueMatches(all, this.matchNode(branch, index, cache, referenceStack)), []);
				break;
			case 'sequence': {
				let positions: TMatchState[] = [{ end: index, captures: [] }];
				for (const child of node.nodes) {
					const nextPositions: TMatchState[] = [];
					for (const position of positions) {
						for (const nextState of this.matchNode(child, position.end, cache, referenceStack)) {
							pushUniqueMatches(nextPositions, [{
								end: nextState.end,
								captures: mergeCaptures(position.captures, nextState.captures),
							}]);
						}
					}

					positions = nextPositions;
					if (!positions.length) break;
				}
				results = positions;
				break;
			}
			case 'repeat': {
				const [min, max] = node.quantity;
				const found: TMatchState[] = [];

				const visit = (state: TMatchState, count: number) => {
					if (count >= min) pushUniqueMatches(found, [state]);
					if (count === max) return;

					for (const nextState of this.matchNode(node.node, state.end, cache, referenceStack)) {
						if (nextState.end === state.end) continue;
						visit({
							end: nextState.end,
							captures: mergeCaptures(state.captures, nextState.captures),
						}, count + 1);
					}
				};

				visit({ end: index, captures: [] }, 0);
				results = found;
				break;
			}
			case 'not':
				results = index < this.content.length && !this.matchNode(node.node, index, cache, referenceStack).some((nextIndex) => nextIndex.end > index)
					? [{ end: index + 1, captures: [] }]
					: [];
				break;
			case 'assertion': {
				let matches = false;

				if (node.direction === 'ahead') {
					matches = this.matchNode(node.node, index, cache, referenceStack).length > 0;
				} else {
					for (let start = 0; start <= index; start++) {
						if (this.matchNode(node.node, start, cache, referenceStack).some((state) => state.end === index)) {
							matches = true;
							break;
						}
					}
				}

				results = matches !== Boolean(node.negative) ? [{ end: index, captures: [] }] : [];
				break;
			}
			case 'reference': {
				if (referenceStack.includes(node.patternId)) {
					throw new Error(`Cyclic references are not implemented yet for pattern id "${node.patternId}".`);
				}

				const compiled = this.compiledPatternsById.get(node.patternId);
				if (!compiled) {
					results = [];
					break;
				}

				results = this.matchNode(compiled.ast, index, cache, [...referenceStack, node.patternId]);
				break;
			}
			case 'capture': {
				results = this.matchNode(node.node, index, cache, referenceStack).map((state) => ({
					end: state.end,
					captures: mergeCaptures(state.captures, [{
						name: node.name,
						index,
						length: state.end - index,
						value: this.content.slice(index, state.end),
					}]),
				}));
				break;
			}
		}

		nodeCache.set(index, results);
		return results;
	}

	resolve() {
		this.compilePatterns();
		this.matches = [];
		this.captures = [];

		for (let index = 0; index < this.content.length; index++) {
			for (const compiled of this.compiledPatterns) {
				if (compiled.minLength > this.content.length - index) continue;

				const cache = new WeakMap<TPatternNode, Map<number, TMatchState[]>>();
				const matches = sortMatchStatesDescending(this.matchNode(compiled.ast, index, cache));
				const state = matches.find((value) => value.end > index);
				if (!state) continue;

				const value = this.content.slice(index, state.end);
				this.matches.push({
					id: compiled.id,
					pattern: compiled.source,
					index,
					length: state.end - index,
					value,
				});
				this.captures.push({
					id: compiled.id,
					pattern: compiled.source,
					index,
					length: state.end - index,
					value,
					groups: groupCaptures(state.captures),
					captures: state.captures,
				});
				compiled.pattern.call(value, index, compiled.source);
			}
		}
	}
}
