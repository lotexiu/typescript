class TMaskToken {
	constructor(readonly value: string){}
}

class TMaskRuleToken {
	readonly test: RegExp

	constructor(
		readonly value: string,
		readonly min: number,
		readonly max: number,
		readonly flags?: string,
	){
		this.test = new RegExp(`^(?:${value})$`, flags)
	}
}

export {
	TMaskToken,
	TMaskRuleToken,
}