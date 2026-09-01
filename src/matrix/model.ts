import { computed } from "@ts/computed/model";
import { model } from "@ts/model/model";
import { Subscription } from "@ts/subscription/model";

type TArrayble<T> = { [Idx in number]: T };
type TNewArrayble<T> = new (length: number) => TArrayble<T>;

class Matrix<T> extends Subscription<TArrayble<T>> {
	readonly dimensions = model<number[]>([256, 256]);
	readonly size = computed(() => {
		return this.dimensions.value.reduce((acc, dim) => acc * dim, 1);
	}, [this.dimensions]);

	readonly dataClass = model<TNewArrayble<T>>(Array);

	private readonly _data = computed(() => {
		return new this.dataClass.value(this.size.value);
	}, [this.size, this.dataClass]);

	get data() {
		return this._data.value;
	}

	private index(indexes: number[]): number {
		return indexes.reduce((acc, idx, dim) => acc + idx * this.dimensions.value[dim], 0);
	}

	get(...indexes: number[]): T {
		return this.data[this.index(indexes)];
	}

	set(value: T, ...indexes: number[]): void {
		this.data[this.index(indexes)] = value;
		this.notifies(this.data);
	}
}

export { Matrix };
