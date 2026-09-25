import { TRecord } from '@tsn-object/types';

class BitwiseUtils {
	static enum<T extends string[]>(...keys: T): TRecord<[T[number], number]> {
		const enumObject: TRecord<[string, number]> = {};
		for (let i = 0; i < keys.length; i++) {
			enumObject[keys[i]] = 1 << i;
		}
		return enumObject;
	}

	static actives<T extends TRecord<[string, number]>>(value: number, enumObject: T): (keyof T)[] {
		const actives: (keyof T)[] = [];
		for (const key in enumObject) {
			if (value & enumObject[key]) {
				actives.push(key);
			}
		}
		return actives;
	}
}

const { enum: bitEnum } = BitwiseUtils;

export { BitwiseUtils, bitEnum };
