import { TAs, TNullable } from '@ts/types';
import { TDiff, TPath, TPathValue, TRecord } from './types';

/**
 * @internal
 */
class ObjectUtils {
	static valueFromPath<const T, const P extends TPath<T> | undefined>(
		obj: T,
		path?: P
	): T | TPathValue<T, P> {
		if (!path) return obj;
		return String(path)
			.split('.')
			.reduce((acc: any, key: string): any => {
				return acc[key];
			}, obj);
	}

	static setValueFromPath<
		const T,
		const Path extends TPath<T>,
		const Value extends TPathValue<T, Path>,
	>(obj: T, path: Path, value: Value): Value {
		const keys: string[] = String(path).split('.');
		keys.reduce((acc: any, key: string, idx: number): any => {
			if (idx == keys.length - 1) {
				acc[key] = value;
			}
			return acc[key];
		}, obj);
		return value;
	}

	static update<T extends object, U extends Partial<T>>(obj: T, updates: U): TAs<T, U> {
		return Object.assign(obj, updates) as TAs<T, U>;
	}

	static isNullOrUndefined<T>(value: TNullable<T>): value is TNullable {
		return value == null || value == undefined;
	}

	static isObject(value: any): value is Object {
		return value && typeof value === 'object';
	}

	static json(obj: any, compact: boolean = true): string {
		const seen = new Set();
		return JSON.stringify(
			obj,
			(_, value) => {
				if (!ObjectUtils.isObject(value)) return value;
				if (seen.has(value)) return undefined;
				seen.add(value);
				return value;
			},
			compact ? undefined : 2
		);
	}

	static isNull<T>(value: TNullable<T>, nullValues: any[] = []): value is TNullable {
		if (value === null || value === undefined) return true;
		if (nullValues.length === 0) return false;
		for (const candidate of nullValues) {
			if (candidate === value) return true;
		}
		return false;
	}

	static diff<const A extends TRecord, const B extends TRecord>(
		a: A,
		b: B
	): TDiff<A, B> {
		const result: any = {};
		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		for (const key of keys) {
			const aVal: any = a[key];
			const bVal: any = b[key];
			if (!(key in b)) {
				result[key] = ['REMOVED', aVal];
				continue;
			}
			if (!(key in a)) {
				result[key] = ['ADDED', bVal];
				continue;
			}
			if (aVal == bVal) continue;
			if (isObject(aVal) && isObject(bVal)) {
				result[key] = ObjectUtils.diff(aVal, bVal);
				continue;
			}
			result[key] = ['CHANGED', aVal, bVal];
		}
		return result;
	}
}

const { isNull, isNullOrUndefined, json, isObject } = ObjectUtils;

export { ObjectUtils, isNull, isNullOrUndefined, json, isObject };
