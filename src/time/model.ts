import { signal } from '@tsr-node/signal/model';
import { field } from '@ts/composables/field/model';

/** Legacy mutable date with each part as a writable `field`. New code should use `PlainDate`/`PlainTime`. */
class Time {
	// Mutado no lugar pelos `field`s (`setFullYear`, `setMonth`, ...) + `notify()`.
	readonly #date = signal(new Date());

	/** Full year. */
	readonly year = field(
		this.#date,
		(date) => date.getFullYear(),
		(date, value) => date.setFullYear(value)
	);
	/** Month, from 0. */
	readonly month = field(
		this.#date,
		(date) => date.getMonth(),
		(date, value) => date.setMonth(value)
	);
	/** Day of the month. */
	readonly day = field(
		this.#date,
		(date) => date.getDate(),
		(date, value) => date.setDate(value)
	);
	/** Hour. */
	readonly hour = field(
		this.#date,
		(date) => date.getHours(),
		(date, value) => date.setHours(value)
	);
	/** Minutes. */
	readonly minutes = field(
		this.#date,
		(date) => date.getMinutes(),
		(date, value) => date.setMinutes(value)
	);
	/** Seconds. */
	readonly seconds = field(
		this.#date,
		(date) => date.getSeconds(),
		(date, value) => date.setSeconds(value)
	);
	/** Milliseconds. */
	readonly milliseconds = field(
		this.#date,
		(date) => date.getMilliseconds(),
		(date, value) => date.setMilliseconds(value)
	);
	/** Week of the month, from 1 (`ceil(day / 7)`). */
	readonly week = field(
		this.#date,
		(date) => Math.ceil(date.getDate() / 7),
		(date, value) => date.setDate(value * 7)
	);
	/** Day of the week, from 0 (Sunday). */
	readonly weekday = field(
		this.#date,
		(date) => date.getDay(),
		(date, value) => date.setDate(date.getDate() + value - date.getDay())
	);

	/** Starts at `date` (default: now). */
	constructor(date?: Date) {
		if (date) this.#date.set(date);
	}

	/** Moves this instance to `date` (default: right now), notifying every field. */
	refresh(date: Date = new Date()): void {
		this.#date.set(date);
	}

	// Leem a data atual a cada chamada (antes eram `bind` na data inicial, que ficava velha
	// quando o construtor trocava a data ou quando ela era substituída).
	/** Milliseconds since the epoch. */
	getTime(): number {
		return this.#date().getTime();
	}

	/** Same as `Date#getTimezoneOffset`. */
	getTimezoneOffset(): number {
		return this.#date().getTimezoneOffset();
	}

	/** Same as `Date#toString`. */
	toString(): string {
		return this.#date().toString();
	}

	/** Same as `Date#toISOString`. */
	toISOString(): string {
		return this.#date().toISOString();
	}

	/** Same as `Date#toLocaleString`. */
	toLocaleString(...args: Parameters<Date['toLocaleString']>): string {
		return this.#date().toLocaleString(...args);
	}

	/** Same as `Date#toUTCString`. */
	toUTCString(): string {
		return this.#date().toUTCString();
	}

	/** Same as `Date#toJSON`. */
	toJSON(): string {
		return this.#date().toJSON();
	}
}

export { Time };
