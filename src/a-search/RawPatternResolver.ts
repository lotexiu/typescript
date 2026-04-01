import { FragmentedPattern } from "./types";

export class RawPatternResolver {
	private escaped = false;
	private chars = '';
	private bodies: any[] = []
	private fragmentedPattern: FragmentedPattern = {content: []} as any as FragmentedPattern;

	private get currentBody() {
		return this.bodies[this.bodies.length-1] || this.fragmentedPattern;
	}

	addChars() {
		if (this.chars.length > 0) {
			this.currentBody.content.push(this.chars);
			this.chars = '';
		}
	}

	newScope() {
		this.addChars();
		this.bodies.push({content: []});
	}

	endScope() {
		this.addChars();
		const body: any = this.bodies.pop();
		this.currentBody.content.push(body);
	}

	resolve(rawPattern: string): FragmentedPattern{
		for (const char of rawPattern) {
			if (!this.escaped) {
				switch (char) {
					case '\\': this.escaped = true; continue;
					case '(': this.newScope(); continue;
					case ')': this.endScope(); continue;
				}
			}
			this.escaped = false;
			this.chars += char;
		}
		if (this.chars.length > 0) {
			this.currentBody.content.push(this.chars);
		}
		return this.fragmentedPattern;
	}
}
