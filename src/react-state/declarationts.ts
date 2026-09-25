import { bitEnum } from "@tsn/bitwise/utils";

const REACT_STATE_FLAGS = bitEnum(
	'DIRTY',
	'INVALID',
	'OLD_VALUE',
	'RUNNING',
	'QUEUED'
)