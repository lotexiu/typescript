import { DECEMBER } from "./declarations";
import { TDateSetValue, TDateSetChecker } from "./types";

/**
 * Helpers that change a `Date` in place, part by part. For immutable dates without time zones, see `PlainDate`/`PlainTime`.
 */
class DateUtils {
	/** Sets the given parts. Returns the same date. */
	static set(date: Date, value: TDateSetValue) {
		const { year, month, day, hour, minute, second, millisecond } = value;
		if (year !== undefined) date.setFullYear(year);
		if (month !== undefined) date.setMonth(month);
		if (day !== undefined) date.setDate(day);
		if (hour !== undefined) date.setHours(hour);
		if (minute !== undefined) date.setMinutes(minute);
		if (second !== undefined) date.setSeconds(second);
		if (millisecond !== undefined) date.setMilliseconds(millisecond);
		return date;
	}

	/** Adds the given amounts to each part; overflow rolls over (31 Jan + 1 day = 1 Feb). */
	static increment(date: Date, value: TDateSetValue) {
		DateUtils.set(date, {
			year: date.getFullYear() + (value.year ?? 0),
			month: date.getMonth() + (value.month ?? 0),
			day: date.getDate() + (value.day ?? 0),
			hour: date.getHours() + (value.hour ?? 0),
			minute: date.getMinutes() + (value.minute ?? 0),
			second: date.getSeconds() + (value.second ?? 0),
			millisecond: date.getMilliseconds() + (value.millisecond ?? 0),
		});
	}

	/** Moves the flagged parts to their last value: December, last day of the month, 23:59:59.999. */
	static setEnd(date: Date, value: TDateSetChecker) {
		const { month, day, hour, minute, second, millisecond } = value;
		if (month) date.setMonth(DECEMBER);
		if (day) {
			date.setDate(1);
			date.setMonth(date.getMonth() + 1);
			date.setDate(0);
		}
		if (hour) date.setHours(23);
		if (minute) date.setMinutes(59);
		if (second) date.setSeconds(59);
		if (millisecond) date.setMilliseconds(999);
	}

	/** Moves the flagged parts to their first value: January, day 1, 00:00:00.000. */
	static setStart(date: Date, value: TDateSetChecker) {
		const { month, day, hour, minute, second, millisecond } = value;
		if (month) date.setMonth(0);
		if (day) date.setDate(1);
		if (hour) date.setHours(0);
		if (minute) date.setMinutes(0);
		if (second) date.setSeconds(0);
		if (millisecond) date.setMilliseconds(0);
	}
}

export { DateUtils };
