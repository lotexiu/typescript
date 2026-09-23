import { Subscription } from '../subscription/model';
import { Model } from '../model/model';
import { TFieldGet, TFieldSet } from './types';
import { TSubscription } from '@ts/subscription/types';

class ReadField<S, V> extends Subscription<ReadField<S, V>> {
	protected readonly source: Model<S>;
	protected readonly get: TFieldGet<S, V>;
	protected readonly dependencies: TSubscription[];

	#changed = true;
	#value?: V;
	get value() {
		if (this.#changed) {
			this.#changed = false;
			this.#value = this.get(this.source.value);
		}
		return this.#value!;
	}

	constructor(source: Model<S>, get: TFieldGet<S, V>, dependencies: TSubscription[] = []) {
		super();
		this.source = source;
		this.get = get;
		this.dependencies = dependencies;

		this.source.subscribe(() => {
			this.#changed = true;
			this.notifies(this);
		});

		dependencies.forEach((dependency) => {
			dependency.subscribe(() => {
				this.#changed = true;
				this.notifies(this);
			});
		});
	}
}

class Field<S, V> extends ReadField<S, V> {
	protected _set: TFieldSet<S, V>;

	constructor(
		source: Model<S>,
		get: TFieldGet<S, V>,
		set: TFieldSet<S, V>,
		dependencies: TSubscription[] = []
	) {
		super(source, get, dependencies);
		this._set = set;
	}

	set(value: V): boolean {
		const prev = this.value;
		this._set(this.source.value, value);
		this.source.notifies(this.source.value);
		return !Object.is(prev, this.value);
	}

	update(fn: (value: V) => V): boolean {
		return this.set(fn(this.value));
	}
}

function readField<S, V>(source: Model<S>, get: TFieldGet<S, V>, dependencies: TSubscription[]): ReadField<S, V> {
	return new ReadField(source, get, dependencies);
}

function field<S, V>(source: Model<S>, get: TFieldGet<S, V>, set: TFieldSet<S, V>, dependencies: TSubscription[] = []): Field<S, V> {
	return new Field(source, get, set, dependencies);
}

export { ReadField, readField, Field, field };
