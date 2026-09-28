import { MS_CONVERTIONS } from "./declarations";
import { TDateSetValue, TDateSetChecker } from "./types";

class DateUtils {
	static formatMS(ms: number) {
		const [unit, _, factor] = MS_CONVERTIONS.find(([_, threshold]) => ms < threshold) ?? MS_CONVERTIONS.at(-1)!;
		return `${Math.round(ms * factor)} ${unit}`;
	}

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

	static setEnd(date: Date, value: TDateSetChecker) {
		const { month, day, hour, minute, second, millisecond } = value;
		if (month) date.setMonth(12);
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
