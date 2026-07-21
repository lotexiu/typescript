import { TAs, TNullable } from "@ts/types";
import { TDiffs, TEntriesReturn, TObject, TPath, TPathResolver } from "./types";

/**
 * @internal
*/
class _Object {
	/** Reads a nested value out of `obj` following a dot-separated `path` (e.g. `"a.b.c"`), typed via `TPath`/`TPathResolver`. */
	static valueFromPath<
		const T,
		const Path extends TPath<T>,
	>(obj: T, path: Path): TPathResolver<T, Path> {
		return path.split(".").reduce((acc: any, key: string): any => {
			return acc[key];
		}, obj);
	}

	/** Writes `value` into `obj` at a nested dot-separated `path`, creating/traversing intermediate keys along the way. */
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

	/** Shallow-merges `updates` onto `obj` via `Object.assign`, typed as the combined shape. */
	static update<T extends object, U extends Partial<T>>(obj: T, updates: U): TAs<T, U> {
		return Object.assign(obj, updates) as TAs<T, U>;
	}

	/** Typed `Object.entries` — keeps each `[key, value]` pair's value type instead of widening to `any`. */
	static entries<T extends {}>(value: T): TEntriesReturn<T>[] {
		return Object.entries(value) as TEntriesReturn<T>[];
	}

	/** True for `null` or `undefined` (loose equality — catches both in one check). */
	static isNullOrUndefined<T>(value: TNullable<T>): value is TNullable {
		return value == null || value == undefined;
	}

	/** True for any non-`null` value of type `"object"` (arrays included). */
	static isObject(value: unknown): value is Object {
		return value !== null && typeof value === 'object';
	}

	/** `JSON.stringify` that tolerates circular references (dropping them) instead of throwing. */
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

	/** True for `null`/`undefined`, or for any value strictly-equal to one of `nullValues`. */
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

	/** Recursively diffs `a` against `b`, tagging each differing path as `added`/`removed`/`changed`. */
	static diffs<const A, const B>(a: TObject<A>, b: TObject<B>): TDiffs<A, B> {
		return _Object.recursiveDiffs(a, b);
	}
}

const {
	isNull,
	isNullOrUndefined,
	json,
} = _Object;

export {
	_Object,
	isNull,
	isNullOrUndefined,
	json,
}