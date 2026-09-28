class DatePickerUtils {
	static startOfDay(date: Date): Date {
		const clone = new Date(date);
		clone.setHours(0, 0, 0, 0);
		return clone;
	}

	static sameDay(a: Date, b: Date | undefined): boolean {
		if (!b) return false;
		return DatePickerUtils.startOfDay(a).getTime() === DatePickerUtils.startOfDay(b).getTime();
	}

	static isWithinRange(date: Date, start: Date | undefined, end: Date | undefined): boolean {
		if (!start || !end) return false;
		const [from, to] = start.getTime() <= end.getTime() ? [start, end] : [end, start];
		const time = DatePickerUtils.startOfDay(date).getTime();
		return time > DatePickerUtils.startOfDay(from).getTime() && time < DatePickerUtils.startOfDay(to).getTime();
	}
}

export { DatePickerUtils };
