import { ParserGate } from "./node/model";

/** @internal */
type TGatePatternInfo = {
	gate: ParserGate
	side: 'open' | 'close' | 'symmetric'
}

export {
	TGatePatternInfo
}