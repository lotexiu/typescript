import { MS_CONVERTIONS } from "./declarations";

type TMSConvertion = [unit: string, threshold: number, factor: number];
type TMSConvertions = typeof MS_CONVERTIONS;
type TTimeUnit = TMSConvertions[number][0];

type TDateKeys = "year" | "month" | "day" | "hour" | "minute" | "second" | "millisecond";

type TDateSetValue = Partial<Record<TDateKeys, number>>;

type TDateSetChecker = Partial<Record<Exclude<TDateKeys, 'year'>, boolean>>;

export { TMSConvertion, TMSConvertions, TTimeUnit, TDateSetValue, TDateSetChecker };
