class TMaskStaticToken {
	constructor(readonly value: string){}
}

class TMaskRuleToken {
	_test?: RegExp
	get test() {
		if (!this._test) {
			this._test = new RegExp(`^(?:${this.value})$`, this.flags)
		}
		return this._test
	}

	constructor(
		readonly value: string,
		readonly min: number,
		readonly max: number,
		readonly flags?: string,
	){}
}

type TMaskToken = TMaskStaticToken | TMaskRuleToken

export {
	TMaskToken,
	TMaskStaticToken,
	TMaskRuleToken,
}