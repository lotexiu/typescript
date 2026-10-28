import { signal } from '@tsr-node/signal/model';
import { field } from '@ts/composables/field/model';

class Time {
	// Mutado no lugar pelos `field`s (`setFullYear`, `setMonth`, ...) + `notify()`.
	readonly #date = signal(new Date());

	readonly year = field(
		this.#date,
		(date) => date.getFullYear(),
		(date, value) => date.setFullYear(value)
	);
	readonly month = field(
		this.#date,
		(date) => date.getMonth(),
		(date, value) => date.setMonth(value)
	);
	readonly day = field(
		this.#date,
		(date) => date.getDate(),
		(date, value) => date.setDate(value)
	);
	readonly hour = field(
		this.#date,
		(date) => date.getHours(),
		(date, value) => date.setHours(value)
	);
	readonly minutes = field(
		this.#date,
		(date) => date.getMinutes(),
		(date, value) => date.setMinutes(value)
	);
	readonly seconds = field(
		this.#date,
		(date) => date.getSeconds(),
		(date, value) => date.setSeconds(value)
	);
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

	constructor(date?: Date) {
		if (date) this.#date.set(date);
	}

	/** Moves this instance to `date` (default: right now), notifying every field. */
	refresh(date: Date = new Date()): void {
		this.#date.set(date);
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
