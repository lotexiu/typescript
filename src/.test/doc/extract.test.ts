import { describe, it, expect } from 'vitest';
import { extractSource } from '@ts/.scripts/doc/extract';

const source = `
/** A counter. */
class Counter extends Base<number> {
	/** Current count. */
	readonly count: number = 0;
	#hidden = 1;
	private secret = 2;
	/** Adds one. */
	readonly increment = (steps = 1): boolean => true;
	/** Attributes per part. */
	readonly parts = {
		root: (): TAttributes => ({}),
	};
	constructor(start: number) { super(); }
	static of(start: number): Counter { return new Counter(start) }
	get double(): number { return 2 }
	/** @internal */
	internalThing(): void {}
}

/** Description. */
/** @internal */
const HIDDEN = 1;

/** Keys. */
const KEYS = { UP: 'ArrowUp', DOWN: 'ArrowDown' } as const;

type TPair<A> = { readonly left: A; right?: A };

declare global {
	interface String {
		shout: () => string;
	}
}

export { Counter, KEYS };
export type { TPair };
`;

const file = extractSource(source, 'src/sample/model.ts');
const byName = (name: string) => file.declarations.find((declaration) => declaration.name === name)!;

describe('extractSource', () => {
	it('lists public members with signatures, hiding private, # and @internal ones', () => {
		const counter = byName('Counter');
		expect(counter.signature).toBe('class Counter extends Base<number>');
		expect(counter.members.map((member) => `${member.kind} ${member.signature}`)).toEqual([
			'property readonly count: number',
			'method increment(steps = 1): boolean',
			'method parts.root(): TAttributes',
			'constructor constructor(start: number)',
			'method static of(start: number): Counter',
			'getter get double(): number',
		]);
	});

	it('keeps member JSDoc and lets parts inherit the JSDoc of their object', () => {
		const members = byName('Counter').members;
		expect(members.find((member) => member.name === 'count')?.doc?.description).toBe('Current count.');
		expect(members.find((member) => member.name === 'parts.root')?.doc?.description).toBe('Attributes per part.');
	});

	it('merges stacked JSDoc blocks and reads @internal from any of them', () => {
		const hidden = byName('HIDDEN');
		expect(hidden.doc?.description).toBe('Description.');
		expect(hidden.internal).toBe(true);
	});

	it('describes constant objects and type literals member by member', () => {
		expect(byName('KEYS').members.map((member) => member.signature)).toEqual(["UP: 'ArrowUp'", "DOWN: 'ArrowDown'"]);
		const pair = byName('TPair');
		expect(pair.signature).toBe('type TPair<A> = { … }');
		expect(pair.members.map((member) => member.signature)).toEqual(['readonly left: A', 'right?: A']);
	});

	it('reads export clauses and global augmentations', () => {
		expect(byName('Counter').exported).toBe(true);
		expect(byName('HIDDEN').exported).toBe(false);
		expect(file.globals).toEqual([expect.objectContaining({ target: 'global', name: 'String', members: [expect.objectContaining({ name: 'shout' })] })]);
		expect(file.sideEffect).toBe(true);
	});
});
