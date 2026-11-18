import { describe, it, expect } from 'vitest';
import { TypescriptLang } from '@ts/language/declarations/programing/typescript/declarations';
import { preferHashPrivate } from '@ts/language/declarations/programing/typescript/validations';
import { Language } from '@ts/language/model';

const typescript = Language.define({ ...TypescriptLang, validate: [preferHashPrivate] });

function problems(source: string): string[] {
	return typescript.analyze(source, 'probe.ts').diagnostics.map((diagnostic) => `${diagnostic.rule}: ${diagnostic.message}`);
}

const RECOGNIZED: Record<string, string> = {
	'type predicates': 'class A { static isX<T>(value: unknown): value is Set<T> { return true } check(value: unknown): asserts value is string {} }',
	'methods named get and set': 'class A { get(key: string): number { return 1 } set(key: string): void {} get size(): number { return 0 } }',
	'member access inside template interpolation': 'const label = `${this.id}-${item.name}`;',
	'empty template': 'const empty = ``;',
	'contextual keywords as names': 'const unique = 1; out.push(type); instance.set = set; const { get, of } = map;',
	'shift operators and generics closing with >= and >>': 'x >>>= 0; y = a >> 2; z = a >>> 1; w >>= 3; let m: Map<K, Set<T>>= new Map(); let n: A<B<C<D>>> = x;',
	'infer with constraint and template literal types': 'type A<T> = T extends Array<infer R> ? R : never; type B<T> = `${T}` extends `${infer R extends number}` ? R : never; type P<K extends string> = `${K}.${string}`;',
	'mapped type modifiers': 'type M<T> = { -readonly [K in keyof T]-?: T[K] }; type N<T> = { +readonly [K in keyof T]+?: T[K] };',
	'JSDoc inside object literals and before parameters': 'const o = { /** a */ a: 1, /** b */ b() { return 1 } }; class C { constructor(/** value */ readonly value: number) {} }',
	'instantiation expressions': 'const keyOf = CollectionUtils.key<T, K>; call(fn<T>, other);',
	'this parameters': 'function f(this: Window, value: number) {} type F = (this: Node, event: Event) => void;',
	'trailing commas': 'const list = [1, 2,]; f(a, b,); function g(a: number, b: number,) {} type T<A, B,> = [A, B,];',
	'leading union and intersection operators': 'type U =\n\t| A\n\t/** doc */\n\t| B; type I =\n\t& A\n\t& B;',
	'call and construct signatures': 'type R<T> = { (): T; new (value: T): R<T>; version(): number };',
	'numeric literals': 'const values = [0xff, 0b1010, 0o17, 1_000, 10n, 1e10, 1.5];',
	'array elisions and optional element access': 'const [, second, , fourth] = list; const label = labels?.[key] ?? key;',
	'property named default and modifiers as names': 'class L { static default: string = "x"; readonly readonly = 1; }',
	'stacked JSDoc blocks': '/** Description. */\n/** @internal */\nconst VALUE = 1;',
};

describe('TypescriptLang', () => {
	for (const [name, source] of Object.entries(RECOGNIZED)) {
		it(`recognizes ${name}`, () => {
			expect(problems(source)).toEqual([]);
		});
	}

	it('applies the ASI rule to return, break and continue', () => {
		const { root } = typescript.analyze('function f() {\n\tif (x) return\n\tvalue = 1\n\tfor (;;) { break\n\tlabel = 2 }\n}', 'probe.ts');
		const kinds: string[] = [];
		root.walk((node) => {
			if (node.kind === 'ReturnStatement' || node.kind === 'BreakStatement') kinds.push(`${node.kind}:${node.field('arg')?.text ?? node.field('label')?.text ?? ''}`);
		});
		expect(kinds).toEqual(['ReturnStatement:', 'BreakStatement:']);
	});

	it('reports what the grammar does not recognize instead of skipping it silently', () => {
		expect(problems('const pattern = /a+b/g;')).toEqual([expect.stringMatching(/^unrecognized-syntax/)]);
	});

	it('attaches JSDoc to class members, interface members and enum members', () => {
		const { root } = typescript.analyze('class A { /** The value. */ value = 1; /** Reads. */ read(): number { return 1 } }\ninterface B { /** Name. */ name: string }\nenum C { /** First. */ First }', 'probe.ts');
		const documented: string[] = [];
		root.walk((node) => {
			const doc = node.field('doc');
			if (doc !== undefined && node.kind !== 'Declaration') documented.push(`${node.kind}:${node.field('name')?.text}`);
		});
		expect(documented).toEqual(['PropertyDefinition:value', 'MethodDefinition:read', 'PropertySignature:name', 'EnumMember:First']);
	});

	it('marks optional members and parameters', () => {
		const { root } = typescript.analyze('type T = { left?: number; right: number }; function f(value?: string) {}', 'probe.ts');
		const optional: string[] = [];
		root.walk((node) => {
			if (node.field('optional') !== undefined) optional.push(node.field('name')!.text);
		});
		expect(optional).toEqual(['left', 'value']);
	});

	it('warns about TypeScript private members but not about private constructors', () => {
		expect(problems('class A { private constructor() {} private value = 1 }')).toEqual([expect.stringMatching(/^prefer-hash-private/)]);
	});
});
