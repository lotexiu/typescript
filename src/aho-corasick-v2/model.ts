import { Matrix } from "@ts/matrix/model";

class AhoCorasick {
	constructor(readonly data: any) {}

	static compile(...patterns: string[]) {
		patterns = ['*','/**', '/*', '*/']

		const codesSet = new Set<number>();
		const lenghts: number[] = [];
		let high = 0

		patterns.forEach((p) => {
			const len = p.length;
			lenghts.push(len);
			if (len > high) high = len
			for (let i = 0; i < len; i++) {
				codesSet.add(p.charCodeAt(i));
			}
		});

		const m = new Matrix([2, 3], Array, 0)
		// const codes = new Map([...codesSet].map((c, i) => [c, i]));
		// const width = codesSet.size;
		// let outputs: any[] = []
		// let next: any[] = [];

		// lenghts.forEach((len, pId) => {
		// 	for (let cId = len-1; cId >= 0; cId--) {
		// 		m.set(pId,cId)
		// 	}
		// })

		console.log(m.toString())

		// lenghts.forEach((len, pId) => {
		// 	let state = pId+len
		// 	for (let cId = len-1; cId >= 0; cId--) {
		// 		const code = patterns[pId].charCodeAt(cId)
		// 		const col = codes.get(code)!;
		// 		const id = cId;
		// 		const idx = id * width + col;
		// 		next[idx] = state;
		// 		console.log({ idx, code, col, width, pId, cId, id, state})
		// 		state = id
		// 	}
		// 	outputs[pId + len] ??= []
		// 	outputs[pId + len].push(pId)
		// 	console.log(`${pId + len} => ${pId}`)
		// });

		// info.sort((a, b) => a.idx - b.idx);
		// console.log({info, next, outputs});
		const ac = new AhoCorasick({next, outputs, width, codes})
		ac.scan('/**');
		return ac;
	}

	scan(text: string) {
		const { next, outputs, width, codes } = this.data;
		let state = 0
		let len = text.length
		
		for (let i = 0; i < len; i++) {
			const col = codes.get(text.charCodeAt(i))
			console.log(`state * width + column = ${state * width + col} | next[${state * width + col}] = ${next[state * width + col]}`)
			state = next[state * width + col]
			const end = outputs[state]
			console.log({state, end})
		}
	}
}

export { AhoCorasick };


/** /* */

/* 
0 * 2 + 0 = 0 => 1
1 * 2 + 1 = 3 => 2
2 * 2 + 1 = 5 => 3
3 * 2 + -1 => 0



*/