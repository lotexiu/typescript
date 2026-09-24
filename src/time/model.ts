import { field } from '@ts/field/model';
import { derived, signal } from '@ts/signal/model';
import { CALENDAR_CELLS } from './declarations';
import { TCalendarDay } from './types';

class Time {
	// Mutado no lugar pelos `field`s (`setFullYear`, `setMonth`, ...) + `notify()`.
	readonly #date = signal(new Date());

	readonly year = field(this.#date, (date) => date.getFullYear(), (date, value) => date.setFullYear(value));
	readonly month = field(this.#date, (date) => date.getMonth(), (date, value) => date.setMonth(value));
	readonly day = field(this.#date, (date) => date.getDate(), (date, value) => date.setDate(value));
	readonly hour = field(this.#date, (date) => date.getHours(), (date, value) => date.setHours(value));
	readonly minutes = field(this.#date, (date) => date.getMinutes(), (date, value) => date.setMinutes(value));
	readonly seconds = field(this.#date, (date) => date.getSeconds(), (date, value) => date.setSeconds(value));
	readonly milliseconds = field(
		this.#date,
		(date) => date.getMilliseconds(),
		(date, value) => date.setMilliseconds(value)
	);
	readonly week = field(
		this.#date,
		(date) => Math.ceil(date.getDate() / 7),
		(date, value) => date.setDate(value * 7)
	);
	readonly weekday = field(
		this.#date,
		(date) => date.getDay(),
		(date, value) => date.setDate(date.getDate() + value - date.getDay())
	);

	readonly firstDay = derived(() => new Date(this.year(), this.month(), 1).getDay());
	readonly totalDays = derived(() => new Date(this.year(), this.month() + 1, 0).getDate());
	readonly totalWeeks = derived(() => Math.ceil(this.totalDays() / 7));

	readonly calendarDays = derived(() => {
		const year = this.year();
		const month = this.month();
		const firstDay = this.firstDay();
		const totalDays = this.totalDays();
		const today = this.day();
		const lastDayFromPrevMonth = new Date(year, month, 0).getDate();
		const calendarDays: TCalendarDay[] = [];
		for (let i = 0; i < firstDay; i++) {
			calendarDays.push({ day: lastDayFromPrevMonth - firstDay + i + 1, month: month - 1 });
		}
		for (let i = 0; i < totalDays; i++) {
			const calendarDay: TCalendarDay = { day: i + 1, month };
			if (today === i + 1) calendarDay.today = true;
			calendarDays.push(calendarDay);
		}
		const nextMonthDays = CALENDAR_CELLS - calendarDays.length;
		for (let i = 0; i < nextMonthDays; i++) {
			calendarDays.push({ day: i + 1, month: month + 1 });
		}
		return calendarDays;
	});

	constructor(date?: Date) {
		if (date) this.#date.set(date);
	}

	// Leem a data atual a cada chamada (antes eram `bind` na data inicial, que ficava velha
	// quando o construtor trocava a data ou quando ela era substituída).
	getTime(): number {
		return this.#date().getTime();
	}

	getTimezoneOffset(): number {
		return this.#date().getTimezoneOffset();
	}

	toString(): string {
		return this.#date().toString();
	}

	toISOString(): string {
		return this.#date().toISOString();
	}

	toLocaleString(...args: Parameters<Date['toLocaleString']>): string {
		return this.#date().toLocaleString(...args);
	}

	toUTCString(): string {
		return this.#date().toUTCString();
	}

	toJSON(): string {
		return this.#date().toJSON();
	}
}

export { Time };
