import { TRecord } from '@tsn-object/types';

/** Bit flags kept in a single number: build named flags, combine and test them. */
class BitwiseUtils {
	/**
	 * Named flags: `noneKey` is 0 and each following key gets the next bit (1, 2, 4...).
	 * @example
	 * const flags = BitwiseUtils.enum('none', 'bold', 'italic') // { none: 0, bold: 1, italic: 2 }
	 */
	static enum<K extends string, T extends string[]>(
		noneKey: K,
		...keys: T
	): TRecord<[K | T[number], number]> {
		const enumObject: TRecord<[string, number]> = { [noneKey]: 0 };
		for (let i = 0; i < keys.length; i++) {
			enumObject[keys[i]] = 1 << i;
		}
		return enumObject;
	}

	/** Names of the flags set in `value`. */
	static enabledKeys<T extends TRecord<[string, number]>>(
		value: number,
		enumObject: T
	): (keyof T)[] {
		const actives: (keyof T)[] = [];
		for (const key in enumObject) {
			if (value & enumObject[key]) {
				actives.push(key);
			}
		}
		return actives;
	}

	/** Names of the flags not set in `value`. */
	static disabledKeys<T extends TRecord<[string, number]>>(
		value: number,
		enumObject: T
	): (keyof T)[] {
		const actives: (keyof T)[] = [];
		for (const key in enumObject) {
			if (!(value & enumObject[key])) {
				actives.push(key);
			}
		}
		return actives;
	}

	/** Whether every given flag is set. */
	static isEnabled(value: number, ...flags: number[]): boolean {
		return flags.every((flag) => value & flag);
	}

	/** Whether every given flag is unset. */
	static isDisabled(value: number, ...flags: number[]): boolean {
		return flags.every((flag) => !(value & flag));
	}

	/** Flips the given flags. */
	static toggle(value: number, ...flags: number[]): number {
		return flags.reduce((acc, flag) => acc ^ flag, value);
	}

	/** Clears the given flags. */
	static disable(value: number, ...flags: number[]): number {
		return flags.reduce((acc, flag) => acc & ~flag, value);
	}

	/** Sets the given flags. */
	static enable(value: number, ...flags: number[]): number {
		return flags.reduce((acc, flag) => acc | flag, value);
	}
}

/** Shortcut for `BitwiseUtils.enum`. */
const { enum: bitEnum } = BitwiseUtils;

export { BitwiseUtils, bitEnum };
