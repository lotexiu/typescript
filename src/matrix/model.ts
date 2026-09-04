import { computed } from "@ts/computed/model";
import { model } from "@ts/model/model";
import { Subscription } from "@ts/subscription/model";
import { TMatrixBuffer, TMatrixBufferCtor } from "./types";

class Matrix<T> extends Subscription<TMatrixBuffer<T>> {
	readonly dimensions = model<number[]>([128, 128]);
	readonly dataClass = model<TMatrixBufferCtor<T>>(Array);

	readonly size = computed(
		() => this.dimensions.value.reduce((total, dim) => total * dim, 1),
		[this.dimensions],
	);

	private readonly strides = computed(() => {
		const dims = this.dimensions.value;
		const strides = new Array<number>(dims.length);
		let stride = 1;
		for (let axis = dims.length - 1; axis >= 0; axis--) {
			strides[axis] = stride;
			stride *= dims[axis];
		}
		return strides;
	}, [this.dimensions]);

	private readonly _data = computed(
		() => new this.dataClass.value(this.size.value),
		[this.size, this.dataClass],
	);

	get data(): TMatrixBuffer<T> {
		return this._data.value;
	}

	constructor(
		dimensions?: number[],
		dataClass?: TMatrixBufferCtor<T>,
		filledValue?: T,
	) {
		super();
		if (dimensions) this.dimensions.set(dimensions)
		if (dataClass) this.dataClass.set(dataClass)
		if (filledValue != undefined) this.data.fill(filledValue);
	}

	private flatIndex(indexes: number[]): number {
		const strides = this.strides.value;
		let flat = 0;
		for (let axis = 0; axis < indexes.length; axis++) {
			flat += indexes[axis] * strides[axis];
		}
		return flat;
	}

	get(...indexes: number[]): T {
		return this.data[this.flatIndex(indexes)];
	}

	set(value: T, ...indexes: number[]): void {
		this.data[this.flatIndex(indexes)] = value;
		this.notifies(this.data);
	}

	toString(){
		let text = ''
		this.dimensions.value.forEach((dim, i) => {
			text += `${this.data.slice(i * dim)}\n`
		})
		return text
	}
}

export { Matrix };
