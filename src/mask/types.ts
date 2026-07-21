import { TMaskRuleToken, TMaskStaticToken, TMaskToken } from "./token/model";

type TMaskRule = {
	match: string[];
	flags?: string;
}

export {
	TMaskRule
}