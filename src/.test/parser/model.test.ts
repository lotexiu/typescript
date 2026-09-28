import { describe, it, expect, beforeEach } from 'vitest';
import { Parser } from '@ts/parser/model';
import { ParserGate, ParserNode } from '@ts/parser/node/model';

function setup() {
	return new Parser();
}

describe('Parser — basic non-symmetric gates (parens)', () => {
	const paren = new ParserGate('(', ')');

	it('opens and closes a single top-level node', () => {
		const p = setup();
		p.addGates(paren);
		p.text.set('a(b)c');
		const [node] = p.root.nodes;
		expect(node.start).toBe(1);
		expect(node.end).toBe(4);
		expect(node.unclosed).toBe(false);
		expect(node.content()).toBe('b');
	});

	it('tracks nested nodes as children', () => {
		const p = setup();
		p.addGates(paren);
		p.text.set('(a(b)c)');
		expect(p.root.children).toHaveLength(1);
		const outer = p.root.children[0];
		expect(outer.children).toHaveLength(1);
		const inner = outer.children[0];
		expect(inner.content()).toBe('b');
		expect(outer.content()).toBe('a(b)c');
	});

	it('marks an unclosed node at EOF and closes it at text length', () => {
		const p = setup();
		p.addGates(paren);
		p.text.set('a(b');
		const [node] = p.root.nodes;
		expect(node.unclosed).toBe(true);
		expect(node.end).toBe(3);
	});

	it('recomputes the tree reactively when text changes', () => {
		const p = setup();
		p.addGates(paren);
		p.text.set('(a)');
		expect(p.root.nodes).toHaveLength(1);
		p.text.set('no gates here');
		expect(p.root.nodes).toHaveLength(0);
	});
});

describe('Parser — symmetric gates (quotes)', () => {
	const quote = new ParserGate('"', '"');

	it('opens on the first quote and closes on the second', () => {
		const p = setup();
		p.addGates(quote);
		p.text.set('a"bc"d');
		const [node] = p.root.nodes;
		expect(node.start).toBe(1);
		expect(node.end).toBe(5);
		expect(node.content()).toBe('bc');
	});

	it('toggles open/closed across repeated occurrences (no nesting of the same symmetric gate)', () => {
		const p = setup();
		p.addGates(quote);
		p.text.set('"a"b"c"');
		expect(p.root.nodes).toHaveLength(2);
		expect(p.root.nodes[0].content()).toBe('a');
		expect(p.root.nodes[1].content()).toBe('c');
	});
});

describe('Parser — escape handling', () => {
	it('ignores an escaped closing delimiter, keeping the scope open', () => {
		const p = setup();
		const quote = new ParserGate('"', '"');
		p.addGates(quote);
		p.escape = '\\';
		p.text.set('"a\\"b"');
		const [node] = p.root.nodes;
		expect(node.content()).toBe('a\\"b');
		expect(node.unclosed).toBe(false);
	});

	it('an escaped opening delimiter never opens a scope', () => {
		const p = setup();
		const paren = new ParserGate('(', ')');
		p.addGates(paren);
		p.escape = '\\';
		p.text.set('a\\(b)c');
		expect(p.root.nodes).toHaveLength(0);
	});

	it('a double backslash means the delimiter after it is not escaped', () => {
		const p = setup();
		const quote = new ParserGate('"', '"');
		p.addGates(quote);
		p.escape = '\\';
		p.text.set('"a\\\\"b');
		const [node] = p.root.nodes;
		// \\ is an escaped backslash, so the following " is a real (unescaped) closing quote
		expect(node.content()).toBe('a\\\\');
	});
});

describe('Parser — opaque gates', () => {
	const lineComment = new ParserGate('//', '\n', true, false);

	it('ignores gate-like content inside an opaque scope', () => {
		const p = setup();
		const paren = new ParserGate('(', ')');
		p.addGates(paren, lineComment);
		p.text.set('a//(b)\nc(d)');
		// only the real paren outside the comment should register
		expect(p.root.nodes.filter((n) => n.gate === paren)).toHaveLength(1);
		expect(p.root.nodes.find((n) => n.gate === paren)!.content()).toBe('d');
	});

	it('consumeClose=false excludes the closing delimiter from the node range', () => {
		const p = setup();
		p.addGates(lineComment);
		p.text.set('//hello\nrest');
		const [node] = p.root.nodes;
		expect(node.content()).toBe('hello');
		expect(node.end).toBe(7); // right before the \n, not including it
	});

	it('an opaque scope left unclosed at EOF is still marked unclosed', () => {
		const p = setup();
		p.addGates(lineComment);
		p.text.set('//no newline here');
		const [node] = p.root.nodes;
		expect(node.unclosed).toBe(true);
	});
});

describe('Parser — holeGate (template-literal style semi-transparency)', () => {
	const hole = new ParserGate('${', '}');
	const template = new ParserGate('`', '`', true, true, hole);

	it('the hole gate never opens outside its opaque parent', () => {
		const p = setup();
		p.addGates(template);
		p.text.set('a${b}c');
		expect(p.root.nodes).toHaveLength(0);
	});

	it('the hole gate opens a transparent scope inside the opaque template', () => {
		const p = setup();
		p.addGates(template);
		p.text.set('`a${b}c`');
		const [templateNode] = p.root.nodes;
		expect(templateNode.gate).toBe(template);
		expect(templateNode.children).toHaveLength(1);
		const holeNode = templateNode.children[0];
		expect(holeNode.gate).toBe(hole);
		expect(holeNode.content()).toBe('b');
	});

	it('other gates inside the opaque template (outside the hole) are ignored', () => {
		const p = setup();
		const paren = new ParserGate('(', ')');
		p.addGates(paren, template);
		p.text.set('`a(b)c`');
		expect(p.root.nodes.filter((n) => n.gate === paren)).toHaveLength(0);
	});

	it('gates inside the hole scope work normally (it is transparent)', () => {
		const p = setup();
		const paren = new ParserGate('(', ')');
		p.addGates(paren, template);
		p.text.set('`a${f(b)}c`');
		const templateNode = p.root.nodes.find((n) => n.gate === template)!;
		const holeNode = templateNode.children.find((n) => n.gate === hole)!;
		expect(holeNode.children.some((n) => n.gate === paren)).toBe(true);
	});
});

describe('Parser — gap tracking', () => {
	const paren = new ParserGate('(', ')');

	it('does not populate gaps by default', () => {
		const p = setup();
		p.addGates(paren);
		p.text.set('a(b)c');
		expect(p.root.allGaps).toHaveLength(0);
	});

	it('tracks gaps once trackGaps is enabled', () => {
		const p = setup();
		p.trackGaps = true;
		p.addGates(paren);
		p.text.set('a(b)c');
		expect(p.root.gaps.map((g) => g.text())).toEqual(['a', 'c']);
	});

	it('tracks gaps inside a node too', () => {
		const p = setup();
		p.trackGaps = true;
		p.addGates(paren);
		p.text.set('(a(b)c)');
		const outer = p.root.children[0];
		expect(outer.gaps.map((g) => g.text())).toEqual(['a', 'c']);
	});
});

describe('Parser — multiple sibling/alternative gates', () => {
	it('distinguishes between different gate types at the same nesting level', () => {
		const p = setup();
		const paren = new ParserGate('(', ')');
		const bracket = new ParserGate('[', ']');
		p.addGates(paren, bracket);
		p.text.set('(a)[b]');
		expect(p.root.nodes.map((n) => n.gate)).toEqual([paren, bracket]);
	});

	it('a close delimiter for the wrong gate does not close the current scope', () => {
		const p = setup();
		const paren = new ParserGate('(', ')');
		const bracket = new ParserGate('[', ']');
		p.addGates(paren, bracket);
		p.text.set('(a]b)');
		const [node] = p.root.nodes;
		expect(node.unclosed).toBe(false);
		expect(node.content()).toBe('a]b');
	});
});
