import { TAs, TNullable } from "@ts/types";
import { TDiffs, TEntriesReturn, TObject, TPath, TPathResolver } from "./types";

/**
 * @internal
*/
class _Object {
	static valueFromPath<
		const T,
		const Path extends TPath<T>,
	>(obj: T, path: Path): TPathResolver<T, Path> {
		return path.split(".").reduce((acc: any, key: string): any => {
			return acc[key];
		}, obj);
	}

	static setValueFromPath<
		const T,
		const Path extends TPath<T>,
		const Value extends TPathResolver<T, Path>,
	>(obj: T, path: Path, value: Value): Value {
		const keys: string[] = path.split(".");
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

	static isObject(value: unknown): value is Object {
		return value !== null && typeof value === 'object';
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

	private static recursiveDiffs<const A, const B>(a: TObject<A>, b: TObject<B>, prefix = ''): TDiffs<A, B> {
		const result: any = {};
		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		for (const key of keys) {
			const aVal = (a as any)[key]
			const bVal = (b as any)[key]
			const path = `${prefix}${key}`

			if (!(key in b)) {
				result[key] = { type: 'removed', path, a: aVal }
			} else if (!(key in a)) {
				result[key] = { type: 'added', path, b: bVal }
			} else if (_Object.isObject(aVal) && _Object.isObject(bVal)) {
				result[key] = _Object.recursiveDiffs(aVal, bVal, `${path}.`)
			} else if (aVal !== bVal) {
				result[key] = { type: 'changed', path, a: aVal, b: bVal }
			}
		}
		return result;
	}

	static diffs<const A, const B>(a: TObject<A>, b: TObject<B>): TDiffs<A, B> {
		return _Object.recursiveDiffs(a, b);
	}
}

/** Whether `value` is `null`/`undefined`, or strictly equals one of the given `nullValues`. */
const isNull = _Object.isNull;
/** Whether `value` is `null` or `undefined`. */
const isNullOrUndefined = _Object.isNullOrUndefined;
/** `JSON.stringify` that safely drops circular references (as `undefined`) instead of throwing. */
const json = _Object.json;

export {
	_Object,
	isNull,
	isNullOrUndefined,
	json,
}