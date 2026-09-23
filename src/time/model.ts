import { computed } from "@ts/computed/model";
import { field } from "@ts/field/model";
import { model } from "@ts/model/model";
import { TCalendarDay } from "./types";

class Time {
	#date = model(new Date());
	year = field(
		this.#date,
		(date) => date.getFullYear(),
		(date, value) => date.setFullYear(value),
	);
	month = field(
		this.#date,
		(date) => date.getMonth(),
		(date, value) => date.setMonth(value),
	);
	day = field(
		this.#date,
		(date) => date.getDate(),
		(date, value) => date.setDate(value),
	);
	hour = field(
		this.#date,
		(date) => date.getHours(),
		(date, value) => date.setHours(value),
	);
	minutes = field(
		this.#date,
		(date) => date.getMinutes(),
		(date, value) => date.setMinutes(value),
	);
	seconds = field(
		this.#date,
		(date) => date.getSeconds(),
		(date, value) => date.setSeconds(value),
	);
	milliseconds = field(
		this.#date,
		(date) => date.getMilliseconds(),
		(date, value) => date.setMilliseconds(value),
	);
	week = field(
		this.#date,
		(date) => Math.ceil(date.getDate() / 7),
		(date, value) => date.setDate(value * 7),
	);
	weekday = field(
		this.#date,
		(date) => date.getDay(),
		(date, value) => date.setDate(date.getDate() + value - date.getDay()),
	);

	readonly firstDay = computed(() => new Date(this.year.value, this.month.value, 1).getDay(), [this.year, this.month]);
	readonly totalDays = computed(() => new Date(this.year.value, this.month.value + 1, 0).getDate(), [this.year, this.month]);
	readonly totalWeeks = computed(() => Math.ceil(this.totalDays.value / 7), [this.totalDays]);

	constructor(date?: Date) {
		if (date) this.#date.set(date);
	}

	calendarDays = computed(() => {
		const lastDayFromPrevMonth = new Date(this.year.value, this.month.value, 0).getDate();
		const calendarDays: TCalendarDay[] = [];
		// Previous month days
		for (let i = 0; i < this.firstDay.value; i++) {
			calendarDays.push({
				day: lastDayFromPrevMonth - this.firstDay.value + i + 1,
				month: this.month.value - 1,
			});
		}
		// Current month days
		for (let i = 0; i < this.totalDays.value; i++) {
			const dayCalendar: TCalendarDay = {
				day: i + 1,
				month: this.month.value,
			}
			if (this.day.value === i + 1) dayCalendar.today = true
			calendarDays.push(dayCalendar);
		}
		// Next month days
		for (let i = 0; i < 42 - calendarDays.length; i++) {
			calendarDays.push({
				day: i + 1,
				month: this.month.value + 1,
			});
		}
		return calendarDays;
	},[this.year, this.month])

	getTime = this.#date.value.getTime.bind(this.#date.value);
	getTimezoneOffset = this.#date.value.getTimezoneOffset.bind(this.#date.value);
	toString = this.#date.value.toString.bind(this.#date.value);
	toISOString = this.#date.value.toISOString.bind(this.#date.value);
	toLocaleString = this.#date.value.toLocaleString.bind(this.#date.value);
	toUTCString = this.#date.value.toUTCString.bind(this.#date.value);
	toJSON = this.#date.value.toJSON.bind(this.#date.value);
}

export { Time };