import { TMaskRuleToken, TMaskStaticToken, TMaskToken } from "../token/model";
import { _Regex } from "@tsn/regex/implementations";
import { lazyReadonlyValue } from "@ts/lazy-readonly-value/model";

class MaskCompiledPattern {
	validWithMask = lazyReadonlyValue(()=>{
		return new RegExp('^'+this.tokens.map(token => token instanceof TMaskRuleToken 
			? `${token.value}{${token.min},${token.max}}` 
			: `${_Regex.escapeReservedKeys(token.value)}`
		).join('')+'$', this.flags)
	})
	validWithoutMask = lazyReadonlyValue(()=>{
		return new RegExp('^'+this.tokens.map(token => token instanceof TMaskRuleToken 
			? `${token.value}{${token.min},${token.max}}` : ``
		).join('')+'$', this.flags)
	})

	constructor(
		readonly source: string,
		readonly tokens: TMaskToken[],
		readonly ruleTokens: TMaskRuleToken[],
		readonly staticTokens: TMaskStaticToken[],
		readonly flags: string
	){}
}

export {
	MaskCompiledPattern
}