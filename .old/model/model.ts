import { Subscription } from "../subscription/model";

/**
 * Menor primitivo reativo da lib: guarda um valor e notifica assinantes quando ele muda.
 * Não sabe de UI/DOM e não é um plugin — é a peça que plugins "adaptadores de util"
 * (ex.: MaskPlugin) usam por baixo para virar reativos sem reimplementar notify-on-change.
 */
class Model<T> extends Subscription<T> {
	#value: T
	constructor(value: T) {
		super()
		this.#value = value;
	}

	get value() { return this.#value; }

	notifies(value: T): void {
		super.notifies(value);
	}

	update(fn: (value: T) => T): boolean {
		return this.set(fn(this.#value))
	}

	set(next: T): boolean {
		if (Object.is(next, this.#value)) return false;
		this.#value = next;
		this.notifies(next);
		return true;
	}

	silentUpdate(fn: (value: T) => T): T {
		return this.silentSet(fn(this.#value));
	}

	silentSet(next: T): T {
		if (Object.is(next, this.#value)) return next;
		this.#value = next;
		return next;
	}
}

function model<T>(): Model<T | undefined>;
function model<T>(initial: T): Model<T>;
function model<T>(initial?: T): Model<T> | Model<T | undefined> {
	return new Model(initial)
}

export {
	Model,
	model
}