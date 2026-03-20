import type { TNullable } from "@ts/types";
import { circularReferenceHandler } from "@tsn-object/generic/implementations";

export function json(obj: any): string {
	return JSON.stringify(obj, circularReferenceHandler());
}

export function isNull<T>(
	value: TNullable<T>,
	...customNullValues: any[]
): value is TNullable<null> {
	if (value === null || value === undefined) return true;
	if (customNullValues.length === 0) return false;
	const jsonV = json(value);
	return customNullValues.some((v: any): boolean => json(v) === jsonV);
}

export function isNullOrUndefined<T>(
	value: TNullable<T>,
): value is TNullable<null> {
	return value == null || value == undefined;
}

export function equals<T, R>(
	a: T,
	b: R,
	...customNullValues: any[]
): a is T & R {
	let result: boolean =
		isNull(a, ...customNullValues) && isNull(b, ...customNullValues);
	if (!result) {
		result = json(a) == json(b);
	}
	return result;
}

export function includes<const T extends any[], U>(values: T, value: U): value is T[number] {
	return values.includes(value)
}
