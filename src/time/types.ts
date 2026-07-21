type TTimeUnit = "year" | "month" | "week" | "day" | "hour" | "minute" | "second" | "millisecond";

type TDateSetValue = Partial<Record<TTimeUnit, number>>;

type TDateSetChecker = Partial<Record<Exclude<TTimeUnit, "year">, boolean>>;

type TCalendarDay = {
	day: number;
	month: number;
	today?: boolean;
};

export { TTimeUnit, TDateSetValue, TDateSetChecker, TCalendarDay };
