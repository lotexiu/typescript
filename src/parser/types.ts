import { ParserGate } from "./node/model";

type TGatePatternInfo = {
	gate: ParserGate
	side: 'open' | 'close' | 'symmetric'
}

export {
	TGatePatternInfo
}