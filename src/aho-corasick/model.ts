import { ASCII_ALPHABET_SIZE } from "./declarations";
import { TAhoCorasickMatch, TAhoCorasickScanHooks } from "./types";

class TrieNode {
	readonly children = new Map<number, TrieNode>();
	fail: TrieNode | null = null;
	readonly outputs: number[] = [];
	id = 0;
}

class AhoCorasick {
	private constructor(
		private readonly columnOf: Int32Array,
		private readonly width: number,
		private readonly next: Int32Array,
		private readonly outputs: readonly (readonly number[])[],
		private readonly lengths: readonly number[],
	) {}

	static compile(...patterns: string[]): AhoCorasick {
		const root = AhoCorasick.buildTrie(patterns);
		AhoCorasick.linkFailures(root);
		return AhoCorasick.flatten(root, patterns);
	}

	private static buildTrie(patterns: string[]): TrieNode {
		const root = new TrieNode();

		patterns.forEach((pattern, patternId) => {
			let node = root;
			for (let i = 0; i < pattern.length; i++) {
				const code = pattern.charCodeAt(i);
				let child = node.children.get(code);
				if (!child) {
					child = new TrieNode();
					node.children.set(code, child);
				}
				node = child;
			}
			node.outputs.push(patternId);
		});

		return root;
	}

	private static linkFailures(root: TrieNode): void {
		const queue: TrieNode[] = [];

		for (const child of root.children.values()) {
			child.fail = root;
			queue.push(child);
		}

		for (let head = 0; head < queue.length; head++) {
			const node = queue[head];
			for (const [code, child] of node.children) {
				let fallback = node.fail!;
				while (fallback !== root && !fallback.children.has(code)) {
					fallback = fallback.fail!;
				}
				child.fail = fallback.children.get(code) ?? root;
				child.outputs.push(...child.fail.outputs);
				queue.push(child);
			}
		}
	}

	private static flatten(root: TrieNode, patterns: string[]): AhoCorasick {
		const nodes: TrieNode[] = [root];
		for (let head = 0; head < nodes.length; head++) {
			const node = nodes[head];
			node.id = head;
			for (const child of node.children.values()) nodes.push(child);
		}

		const usedCodes = new Set<number>();
		for (const node of nodes) for (const code of node.children.keys()) usedCodes.add(code);
		const columns = [...usedCodes].sort((a, b) => a - b);
		const width = columns.length;
		const columnOf = new Int32Array(ASCII_ALPHABET_SIZE).fill(-1);
		columns.forEach((code, column) => {
			columnOf[code] = column;
		});

		const next = new Int32Array(nodes.length * width);
		for (const node of nodes) {
			for (let column = 0; column < width; column++) {
				const child = node.children.get(columns[column]);
				if (child) {
					next[node.id * width + column] = child.id;
				} else if (node === root) {
					next[column] = 0;
				} else {
					next[node.id * width + column] = next[node.fail!.id * width + column];
				}
			}
		}

		const outputs = nodes.map((node) => node.outputs);
		const lengths = patterns.map((pattern) => pattern.length);
		return new AhoCorasick(columnOf, width, next, outputs, lengths);
	}

	scan(text: string, hooks: TAhoCorasickScanHooks = {}, start: number = 0, end: number = text.length): TAhoCorasickMatch[] {
		const { onPosition, onMatch } = hooks;
		const { columnOf, width, next, outputs, lengths } = this;
		const matches: TAhoCorasickMatch[] = [];
		let state = 0;

		for (let i = start; i < end; i++) {
			const code = text.charCodeAt(i);

			if (onPosition) {
				const skip = onPosition(i, code);
				if (skip) {
					i += skip - 1;
					state = 0;
					continue;
				}
			}

			const column = code < ASCII_ALPHABET_SIZE ? columnOf[code] : -1;
			state = column < 0 ? 0 : next[state * width + column];

			const ending = outputs[state];
			if (ending.length) {
				const matchEnd = i + 1;
				for (const patternId of ending) {
					const matchStart = matchEnd - lengths[patternId];
					if (onMatch && onMatch(patternId, matchStart, matchEnd) === false) continue;
					matches.push({ patternId, start: matchStart, end: matchEnd });
				}
			}
		}

		return matches;
	}
}

export { AhoCorasick };
