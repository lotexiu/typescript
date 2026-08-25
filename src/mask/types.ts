import { TMaskRuleToken, TMaskToken } from "./token/model";

type TMaskRule = {
	match: string[];
	flags?: string;
}

type TMaskCompiledPattern = {
	source: string
	ruleTokens: TMaskRuleToken[]
	tokens: (TMaskToken | TMaskRuleToken)[]
}

export {
	TMaskRule,
	TMaskCompiledPattern
}