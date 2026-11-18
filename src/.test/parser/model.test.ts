import { describe, it, expect, beforeEach } from 'vitest';
import { Parser } from '@ts/parser/model';
import { ParserGate, ParserNode } from '@ts/parser/node/model';

function setup() {
	return new Parser();
}

describe('Parser — basic non-symmetric gates (parens)', () => {
	const paren = new ParserGate('(', ')');

	it('opens and closes a single top-level node', () => {
		const parser = setup();
		parser.addGates(paren);
		parser.text.set('a(b)c');
		const [node] = parser.root.nodes;
		expect(node.start).toBe(1);
		expect(node.end).toBe(4);
		expect(node.unclosed).toBe(false);
		expect(node.content()).toBe('b');
	});

	it('tracks nested nodes as children', () => {
		const parser = setup();
		parser.addGates(paren);
		parser.text.set('(a(b)c)');
		expect(parser.root.children).toHaveLength(1);
		const outer = parser.root.children[0];
		expect(outer.children).toHaveLength(1);
		const inner = outer.children[0];
		expect(inner.content()).toBe('b');
		expect(outer.content()).toBe('a(b)c');
	});

	it('marks an unclosed node at EOF and closes it at text length', () => {
		const parser = setup();
		parser.addGates(paren);
		parser.text.set('a(b');
		const [node] = parser.root.nodes;
		expect(node.unclosed).toBe(true);
		expect(node.end).toBe(3);
	});

	it('recomputes the tree reactively when text changes', () => {
		const parser = setup();
		parser.addGates(paren);
		parser.text.set('(a)');
		expect(parser.root.nodes).toHaveLength(1);
		parser.text.set('no gates here');
		expect(parser.root.nodes).toHaveLength(0);
	});
});

describe('Parser — symmetric gates (quotes)', () => {
	const quote = new ParserGate('"', '"');

	it('opens on the first quote and closes on the second', () => {
		const parser = setup();
		parser.addGates(quote);
		parser.text.set('a"bc"d');
		const [node] = parser.root.nodes;
		expect(node.start).toBe(1);
		expect(node.end).toBe(5);
		expect(node.content()).toBe('bc');
	});

	it('toggles open/closed across repeated occurrences (no nesting of the same symmetric gate)', () => {
		const parser = setup();
		parser.addGates(quote);
		parser.text.set('"a"b"c"');
		expect(parser.root.nodes).toHaveLength(2);
		expect(parser.root.nodes[0].content()).toBe('a');
		expect(parser.root.nodes[1].content()).toBe('c');
	});
});

describe('Parser — escape handling', () => {
	it('ignores an escaped closing delimiter, keeping the scope open', () => {
		const parser = setup();
		const quote = new ParserGate('"', '"');
		parser.addGates(quote);
		parser.escape = '\\';
		parser.text.set('"a\\"b"');
		const [node] = parser.root.nodes;
		expect(node.content()).toBe('a\\"b');
		expect(node.unclosed).toBe(false);
	});

	it('an escaped opening delimiter never opens a scope', () => {
		const parser = setup();
		const paren = new ParserGate('(', ')');
		parser.addGates(paren);
		parser.escape = '\\';
		parser.text.set('a\\(b)c');
		expect(parser.root.nodes).toHaveLength(0);
	});

	it('a double backslash means the delimiter after it is not escaped', () => {
		const parser = setup();
		const quote = new ParserGate('"', '"');
		parser.addGates(quote);
		parser.escape = '\\';
		parser.text.set('"a\\\\"b');
		const [node] = parser.root.nodes;
		// \\ is an escaped backslash, so the following " is a real (unescaped) closing quote
		expect(node.content()).toBe('a\\\\');
	});
});

describe('Parser — opaque gates', () => {
	const lineComment = new ParserGate('//', '\n', true, false);

	it('ignores gate-like content inside an opaque scope', () => {
		const parser = setup();
		const paren = new ParserGate('(', ')');
		parser.addGates(paren, lineComment);
		parser.text.set('a//(b)\nc(d)');
		// only the real paren outside the comment should register
		expect(parser.root.nodes.filter((node) => node.gate === paren)).toHaveLength(1);
		expect(parser.root.nodes.find((node) => node.gate === paren)!.content()).toBe('d');
	});

	it('consumeClose=false excludes the closing delimiter from the node range', () => {
		const parser = setup();
		parser.addGates(lineComment);
		parser.text.set('//hello\nrest');
		const [node] = parser.root.nodes;
		expect(node.content()).toBe('hello');
		expect(node.end).toBe(7); // right before the \n, not including it
	});

	it('an opaque scope left unclosed at EOF is still marked unclosed', () => {
		const parser = setup();
		parser.addGates(lineComment);
		parser.text.set('//no newline here');
		const [node] = parser.root.nodes;
		expect(node.unclosed).toBe(true);
	});
});

describe('Parser — holeGate (template-literal style semi-transparency)', () => {
	const hole = new ParserGate('${', '}');
	const template = new ParserGate('`', '`', true, true, hole);

	it('the hole gate never opens outside its opaque parent', () => {
		const parser = setup();
		parser.addGates(template);
		parser.text.set('a${b}c');
		expect(parser.root.nodes).toHaveLength(0);
	});

	it('the hole gate opens a transparent scope inside the opaque template', () => {
		const parser = setup();
		parser.addGates(template);
		parser.text.set('`a${b}c`');
		const [templateNode] = parser.root.nodes;
		expect(templateNode.gate).toBe(template);
		expect(templateNode.children).toHaveLength(1);
		const holeNode = templateNode.children[0];
		expect(holeNode.gate).toBe(hole);
		expect(holeNode.content()).toBe('b');
	});

	it('other gates inside the opaque template (outside the hole) are ignored', () => {
		const parser = setup();
		const paren = new ParserGate('(', ')');
		parser.addGates(paren, template);
		parser.text.set('`a(b)c`');
		expect(parser.root.nodes.filter((node) => node.gate === paren)).toHaveLength(0);
	});

	it('gates inside the hole scope work normally (it is transparent)', () => {
		const parser = setup();
		const paren = new ParserGate('(', ')');
		parser.addGates(paren, template);
		parser.text.set('`a${f(b)}c`');
		const templateNode = parser.root.nodes.find((node) => node.gate === template)!;
		const holeNode = templateNode.children.find((node) => node.gate === hole)!;
		expect(holeNode.children.some((node) => node.gate === paren)).toBe(true);
	});
});

describe('Parser — gap tracking', () => {
	const paren = new ParserGate('(', ')');

	it('does not populate gaps by default', () => {
		const parser = setup();
		parser.addGates(paren);
		parser.text.set('a(b)c');
		expect(parser.root.allGaps).toHaveLength(0);
	});

	it('tracks gaps once trackGaps is enabled', () => {
		const parser = setup();
		parser.trackGaps = true;
		parser.addGates(paren);
		parser.text.set('a(b)c');
		expect(parser.root.gaps.map((gap) => gap.text())).toEqual(['a', 'c']);
	});

	it('tracks gaps inside a node too', () => {
		const parser = setup();
		parser.trackGaps = true;
		parser.addGates(paren);
		parser.text.set('(a(b)c)');
		const outer = parser.root.children[0];
		expect(outer.gaps.map((gap) => gap.text())).toEqual(['a', 'c']);
	});
});

describe('Parser — multiple sibling/alternative gates', () => {
	it('distinguishes between different gate types at the same nesting level', () => {
		const parser = setup();
		const paren = new ParserGate('(', ')');
		const bracket = new ParserGate('[', ']');
		parser.addGates(paren, bracket);
		parser.text.set('(a)[b]');
		expect(parser.root.nodes.map((node) => node.gate)).toEqual([paren, bracket]);
	});

	it('a close delimiter for the wrong gate does not close the current scope', () => {
		const parser = setup();
		const paren = new ParserGate('(', ')');
		const bracket = new ParserGate('[', ']');
		parser.addGates(paren, bracket);
		parser.text.set('(a]b)');
		const [node] = parser.root.nodes;
		expect(node.unclosed).toBe(false);
		expect(node.content()).toBe('a]b');
	});
});
