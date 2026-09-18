import { TONE_STOPS } from "./declarations";

type TToneStops = typeof TONE_STOPS
type TToneStop = TToneStops[number]

export {
	TToneStops,
	TToneStop,
}
