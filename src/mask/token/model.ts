import { readonlyValue } from '@ts/composables/readonly-value/model';

/** @internal */
class TMaskStaticToken {
	constructor(readonly value: string) {}
}

/** @internal */
class TMaskRuleToken {
	readonly match = readonlyValue(() => new RegExp(`^(?:${this.value})$`, this.flags));

	constructor(
		readonly value: string,
		readonly min: number,
		readonly max: number,
		readonly flags?: string
	) {}
}

/** @internal */
type TMaskToken = TMaskStaticToken | TMaskRuleToken;

export { TMaskToken, TMaskStaticToken, TMaskRuleToken };
