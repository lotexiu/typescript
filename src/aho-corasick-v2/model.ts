class AhoCorasick {
	constructor(
		public readonly root: any[],
		public readonly nodes: any[],
	) {}

	static compile(...patterns: string[]) {
		let root: any[] = [];
		let nodes: any[] = [];

		patterns.forEach((p) => {
			const len = p.length;
			let node = root;
			let sum = 0;
			for (let i = 0; i < len; i++) {
				const code = p.charCodeAt(i);
				sum += code * 2;
				const next = (nodes[code] ??= []);
				if (i === len - 1) next[-sum] = p;
				node[code] = next;
				node = next;
			}
		});
		return new AhoCorasick(root, nodes);
	}

	scan(text: string) {
		let sum = 0;
		let node = this.root;
		const len = text.length

		for (let i = 0; i < len; i++) {
			const code = text.charCodeAt(i);

		}
	}
}

export { AhoCorasick };
