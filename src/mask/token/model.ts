import { lazyReadonlyValue } from "@ts/lazy-readonly-value/model";

class TMaskStaticToken {
	constructor(readonly value: string){}
}

class TMaskRuleToken {
	readonly match = lazyReadonlyValue(
		()=>new RegExp(`^(?:${this.value})$`, this.flags)
	)

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