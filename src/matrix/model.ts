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

	readonly #strides = computed(() => {
		const dims = this.dimensions.value;
		const strides = new Array<number>(dims.length);
		let stride = 1;
		for (let axis = dims.length - 1; axis >= 0; axis--) {
			strides[axis] = stride;
			stride *= dims[axis];
		}
		return strides;
	}, [this.dimensions]);

	readonly #data = computed(
		() => new this.dataClass.value(this.size.value),
		[this.size, this.dataClass],
	);

	get data(): TMatrixBuffer<T> {
		return this.#data.value;
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

	#flatIndex(indexes: number[]): number {
		const strides = this.#strides.value;
		let flat = 0;
		for (let axis = 0; axis < indexes.length; axis++) {
			flat += indexes[axis] * strides[axis];
		}
		return flat;
	}

	get(...indexes: number[]): T {
		return this.data[this.#flatIndex(indexes)];
	}

	set(value: T, ...indexes: number[]): void {
		this.data[this.#flatIndex(indexes)] = value;
		this.notifies(this.data);
	}

	section(...indexes: number[]): TMatrixBuffer<T> {
		const start = this.#flatIndex(indexes);
		const length = this.#sectionLength(indexes.length);
		return this.data.slice(start, start + length);
	}

	#sectionLength(fixedAxes: number): number {
		if (fixedAxes === 0) return this.size.value;
		return this.#strides.value[fixedAxes - 1];
	}

	toString(): string {
		const dims = this.dimensions.value;
		const lastAxis = dims.length - 1;
		const columns = dims[lastAxis];
		const rowCount = this.size.value / columns;

		let cellWidth = 0;
		this.data.forEach((value) => {
			cellWidth = Math.max(cellWidth, String(value).length);
		});

		const rowIndex = new Array<number>(lastAxis);
		const lines = new Array<string>(rowCount);
		for (let row = 0; row < rowCount; row++) {
			let remainder = row;
			for (let axis = lastAxis - 1; axis >= 0; axis--) {
				rowIndex[axis] = remainder % dims[axis];
				remainder = Math.floor(remainder / dims[axis]);
			}

			const cells: string[] = [];
			this.section(...rowIndex).forEach((value) => {
				cells.push(String(value).padStart(cellWidth));
			});
			lines[row] = cells.join(" ");
		}
		return lines.join("\n");
	}
}

export { Matrix };
