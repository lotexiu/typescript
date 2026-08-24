import { Subscription } from "../subscription/model";

/**
 * Menor primitivo reativo da lib: guarda um valor e notifica assinantes quando ele muda.
 * Não sabe de UI/DOM e não é um plugin — é a peça que plugins "adaptadores de util"
 * (ex.: MaskPlugin) usam por baixo para virar reativos sem reimplementar notify-on-change.
 */
class Model<T> extends Subscription<T> {
	
	constructor(private _value: T) {
		super()
	}

	get value() { return this._value; }

	notifies(value: T): void {
		super.notifies(value);
	}

	update(fn: (value: T) => T): boolean {
		return this.set(fn(this._value))
	}

	set(next: T): boolean {
		if (Object.is(next, this._value)) return false;
		this._value = next;
		this.notifies(next);
		return true;
	}

	silentUpdate(fn: (value: T) => T): T {
		return this.silentSet(fn(this._value));
	}

	silentSet(next: T): T {
		if (Object.is(next, this._value)) return next;
		this._value = next;
		return next;
	}
}

function model<T>(initial: T): Model<T> {
	return new Model(initial);
}

export {
	Model,
	model
}