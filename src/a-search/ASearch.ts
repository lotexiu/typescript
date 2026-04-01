import { RawPatternResolver } from "./RawPatternResolver";
import { FragmentedPattern, Pattern } from "./types";

export class ASearch<const Patterns extends Pattern> {
	readonly DeclaredRawPatterns: Patterns;
	private fragmentedPatterns: FragmentedPattern[] = []

	constructor(
		patterns: Patterns
	) {
		this.DeclaredRawPatterns = patterns;
		this.resolvePatterns();
	}

	private resolvePatterns() {
		for (const [name, rawPattern] of Object.entries(this.DeclaredRawPatterns)) {
			const fragmentedPattern = this.draftPattern(name);
			this.resolveRawPattern(rawPattern);
		}
	}

	private resolveRawPattern(rawPattern: string) {
		const resolver = new RawPatternResolver();
		const fragmentedPattern = resolver.resolve(rawPattern);
		console.log(JSON.stringify(fragmentedPattern, null, 2));
	}

	private draftPattern(name: string): FragmentedPattern {
		return {
			id: name,
			modifiers: [],
			content: [],
			quantity: 1,
		}
	}
}
