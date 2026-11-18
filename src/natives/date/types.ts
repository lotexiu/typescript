
type TDateKeys = "year" | "month" | "day" | "hour" | "minute" | "second" | "millisecond";

/** Date parts to set or add: `year`, `month` (0-based), `day`, `hour`, `minute`, `second`, `millisecond`. */
type TDateSetValue = Partial<Record<TDateKeys, number>>;

/** Which date parts to move to their start or end. */
type TDateSetChecker = Partial<Record<Exclude<TDateKeys, 'year'>, boolean>>;

export { TDateSetValue, TDateSetChecker };
