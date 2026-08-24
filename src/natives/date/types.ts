import { MS_CONVERTIONS } from "./declarations";

type TMSConvertion = [unit: string, threshold: number, factor: number]
type TMSConvertions = typeof MS_CONVERTIONS;
type TTimeUnit = TMSConvertions[number][0]

export {
	TMSConvertion,
	TMSConvertions,
	TTimeUnit,
}