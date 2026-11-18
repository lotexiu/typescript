import { describe, it, expect } from 'vitest';
import { ParserGate, ParserNode, ParserRoot, ParserGap } from '@ts/parser/node/model';

describe('ParserGate', () => {
	it('computes symetric from open === close', () => {
		expect(new ParserGate('"', '"').symetric).toBe(true);
		expect(new ParserGate('(', ')').symetric).toBe(false);
	});

	it('defaults opaque/consumeClose/holeGate', () => {
		const gate = new ParserGate('(', ')');
		expect(gate.opaque).toBe(false);
		expect(gate.consumeClose).toBe(true);
		expect(gate.holeGate).toBeNull();
	});
});

describe('ParserNode', () => {
	const gate = new ParserGate('(', ')');

	it('registers itself as a child of its parent on construction', () => {
		const root = new ParserRoot('(a)');
		const node = new ParserNode(root, root, gate, 0);
		expect(root.children).toContain(node);
	});

	it('contentStart is start + open.length', () => {
		const root = new ParserRoot('(a)');
		const node = new ParserNode(root, root, gate, 0);
		expect(node.contentStart).toBe(1);
	});

	it('close() with consumeClose=true includes the close delimiter in end', () => {
		const root = new ParserRoot('(a)');
		const node = new ParserNode(root, root, gate, 0);
		node.close(2, false);
		expect(node.end).toBe(3);
		expect(node.unclosed).toBe(false);
	});

	it('close() with consumeClose=false excludes the close delimiter from end', () => {
		const noConsume = new ParserGate('//', '\n', true, false);
		const root = new ParserRoot('//a\n');
		const node = new ParserNode(root, root, noConsume, 0);
		node.close(3, false);
		expect(node.end).toBe(3);
	});

	it('close() when unclosed always ends exactly at closeStart, ignoring consumeClose', () => {
		const root = new ParserRoot('(a');
		const node = new ParserNode(root, root, gate, 0);
		node.close(2, true);
		expect(node.end).toBe(2);
		expect(node.unclosed).toBe(true);
	});

	it('content() lazily slices the root text between contentStart and closeStart', () => {
		const root = new ParserRoot('(hello)');
		const node = new ParserNode(root, root, gate, 0);
		node.close(6, false);
		expect(node.content()).toBe('hello');
	});

	it('content() is cached (same readonlyValue instance across reads)', () => {
		const root = new ParserRoot('(hello)');
		const node = new ParserNode(root, root, gate, 0);
		node.close(6, false);
		expect(node.content).toBe(node.content);
	});
});

describe('ParserGap', () => {
	it('lazily slices the root text between start and end', () => {
		const root = new ParserRoot('hello world');
		const gap = new ParserGap(root, root, 0, 5);
		expect(gap.text()).toBe('hello');
	});
});

describe('ParserRoot', () => {
	it('starts with empty children/nodes/gaps', () => {
		const root = new ParserRoot('text');
		expect(root.children).toEqual([]);
		expect(root.nodes).toEqual([]);
		expect(root.gaps).toEqual([]);
		expect(root.allGaps).toEqual([]);
		expect(root.text).toBe('text');
	});
});
