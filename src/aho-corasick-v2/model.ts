import { Matrix } from "@ts/matrix/model";

class AhoCorasick {
	constructor(
		readonly next: any,
		readonly output: any
	) {}

	static compile(...patterns: string[]) {
		const output: any[] = []
		const next: any[] = []

		patterns.forEach((pattern, id) => {
			let len = pattern.length
			let a = 0
			for (let i = 0; i < len; i++) {
				const code = pattern.charCodeAt(i)
				next[code*(i+1)] = a
			}
			
		})
		return new AhoCorasick(next, output)
	}

	scan(text: string) {
		let state= 0
		for (let i = 0; i < text.length; i++) {
			const code = text.charCodeAt(i)
			this.output.data[code + state]
		}
	}
}

export {
	AhoCorasick
}