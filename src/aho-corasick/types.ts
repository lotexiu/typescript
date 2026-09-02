type TAhoCorasickMatch = {
	patternId: number
	start: number
	end: number
}

type TOnPositionHook = (index: number, code: number) => number | void

type TOnMatchHook = (patternId: number, start: number, end: number) => boolean | void

type TAhoCorasickScanHooks = {
	onPosition?: TOnPositionHook
	onMatch?: TOnMatchHook
}

export {
	TAhoCorasickMatch,
	TOnPositionHook,
	TOnMatchHook,
	TAhoCorasickScanHooks,
}
