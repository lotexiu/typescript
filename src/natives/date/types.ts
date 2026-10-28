
type TDateKeys = "year" | "month" | "day" | "hour" | "minute" | "second" | "millisecond";

type TDateSetValue = Partial<Record<TDateKeys, number>>;

type TDateSetChecker = Partial<Record<Exclude<TDateKeys, 'year'>, boolean>>;

export { TDateSetValue, TDateSetChecker };
