import { TMSConvertion } from "./types";

const MS_CONVERTIONS = [
	['ns', 0.001, 1e6],
	['µs', 1, 1000],
	['ms', 1000, 1],
	['s', 60000, 1 / 1000],
	['min', 3600000, 1 / 60000],
	['hour', 86400000, 1 / 3600000],
	['days', 604800000, 1 / 86400000],
	['week', 18748800000, 1 / 604800000],
] as const satisfies TMSConvertion[]

export {
	MS_CONVERTIONS
}