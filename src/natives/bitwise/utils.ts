import { TRecord } from '@tsn-object/types';

class BitwiseUtils {
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

	static isEnabled(value: number, ...flags: number[]): boolean {
		return flags.every((flag) => value & flag);
	}

	static isDisabled(value: number, ...flags: number[]): boolean {
		return flags.every((flag) => !(value & flag));
	}

	static toggle(value: number, ...flags: number[]): number {
		return flags.reduce((acc, flag) => acc ^ flag, value);
	}

	static disable(value: number, ...flags: number[]): number {
		return flags.reduce((acc, flag) => acc & ~flag, value);
	}

	static enable(value: number, ...flags: number[]): number {
		return flags.reduce((acc, flag) => acc | flag, value);
	}
}

const { enum: bitEnum } = BitwiseUtils;

export { BitwiseUtils, bitEnum };
