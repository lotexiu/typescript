import { TAs, TNullable } from "@ts/types";
import { TDiff, TEntriesReturn, TPath, TPathValue } from "./types";

/**
 * @internal
*/
class _Object {
	static valueFromPath<const T, const P extends TPath<T>>(obj: T, path: P): TPathValue<T, P> {
		return String(path).split(".").reduce((acc: any, key: string): any => {
			return acc[key];
		}, obj);
	}

	static setValueFromPath<
		const T,
		const Path extends TPath<T>,
		const Value extends TPathValue<T, Path>,
	>(obj: T, path: Path, value: Value): Value {
		const keys: string[] = String(path).split(".");
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

	static entries<T extends {}>(value: T): TEntriesReturn<T>[] {
		return Object.entries(value) as TEntriesReturn<T>[];
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
				if (!_Object.isObject(value)) return value;
				if (seen.has(value)) return undefined
				seen.add(value);
				return value;
			},
			compact ? undefined : 2,
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

	static diff<const A extends object, const B extends object>(a: A, b: B): TDiff<A, B> {
		const result: any = {};
		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		for (const key of keys) {
			const aVal: any = (a as any)[key];
			const bVal: any = (b as any)[key];
			if (!(key in b)) {result[key] = ['REMOVED', aVal]; continue;}
			if (!(key in a)) {result[key] = ['ADDED', bVal]; continue;}
			if (aVal == bVal) continue;
			if (isObject(aVal) && isObject(bVal)) {result[key] = _Object.diff(aVal, bVal); continue;}
			result[key] = ['CHANGED', aVal, bVal];
		}
		return result;
	}
}

const {
	isNull,
	isNullOrUndefined,
	json,
	isObject,
} = _Object;

export {
	_Object,
	isNull,
	isNullOrUndefined,
	json,
	isObject,
}