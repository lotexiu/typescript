import { INTERNAL } from '@tsn-object/declarations';
import { TField } from './types';

class FieldUtils {
	static set<S, V>(this: TField<S, V>, value: V): boolean {
		const previous = this();
		const { setter, source } = this[INTERNAL];
		setter(source(), value);
		source.notify();
		return !Object.is(previous, this());
	}

	static update<S, V>(this: TField<S, V>, fn: (value: V) => V): boolean {
		return this.set(fn(this()));
	}
}

export { FieldUtils };
