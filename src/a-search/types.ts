export type Pattern = {
	[names: string]: string;
}

export type FragmentedPattern = {
	id: string;
	modifiers: string[];
	content: (string|FragmentedPattern)[];
	quantity: [number, number] | 1;
}
