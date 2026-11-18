import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { TMatrixBuffer, TMatrixBufferCtor } from './types';

/** An N-dimensional grid stored in one flat buffer (a plain array or a typed array), reactive to writes. */
class Matrix<T> {
	/** Size of each axis. */
	readonly dimensions = signal<number[]>([128, 128]);
	/** Buffer constructor (`Array`, `Float32Array`...). */
	readonly dataClass = signal<TMatrixBufferCtor<T>>(Array);

	/** Total number of cells. */
	readonly size = computed(() => this.dimensions().reduce((total, dim) => total * dim, 1));

	readonly #strides = computed(() => {
		const dims = this.dimensions();
		const strides = new Array<number>(dims.length);
		let stride = 1;
		for (let axis = dims.length - 1; axis >= 0; axis--) {
			strides[axis] = stride;
			stride *= dims[axis];
		}
		return strides;
	});

	// O buffer só é recriado quando o tamanho ou o tipo mudam.
	readonly #buffer = computed(() => {
		const DataClass = this.dataClass();
		return new DataClass(this.size());
	});
	// Avisado a cada `set` (o buffer é mutado no lugar, sem trocar de referência).
	readonly #revision = signal(0);

	// O buffer atual; notifica a cada `set` e a cada troca de buffer. `equal` sempre falso porque
	// um `set` devolve o mesmo buffer (mutado) e precisa notificar mesmo assim.
	/** The buffer; notifies on every `set`. */
	readonly data = computed(
		() => (this.#revision(), this.#buffer()),
		() => false
	);

	/** Creates the grid, optionally filled with `filledValue`. */
	constructor(dimensions?: number[], dataClass?: TMatrixBufferCtor<T>, filledValue?: T) {
		if (dimensions) this.dimensions.set(dimensions);
		if (dataClass) this.dataClass.set(dataClass);
		if (filledValue != undefined) this.#buffer().fill(filledValue);
	}

	#flatIndex(indexes: number[]): number {
		const strides = this.#strides();
		let flat = 0;
		for (let axis = 0; axis < indexes.length; axis++) {
			flat += indexes[axis] * strides[axis];
		}
		return flat;
	}

	/** Value at the given indexes (one per axis). */
	get(...indexes: number[]): T {
		return this.#buffer()[this.#flatIndex(indexes)];
	}

	/** Writes a value at the given indexes. */
	set(value: T, ...indexes: number[]): void {
		this.#buffer()[this.#flatIndex(indexes)] = value;
		this.#revision.notify();
	}

	/** Copy of the cells under the given leading indexes (a row, a plane...). */
	section(...indexes: number[]): TMatrixBuffer<T> {
		const start = this.#flatIndex(indexes);
		const length = this.#sectionLength(indexes.length);
		return this.#buffer().slice(start, start + length);
	}

	#sectionLength(fixedAxes: number): number {
		if (fixedAxes === 0) return this.size();
		return this.#strides()[fixedAxes - 1];
	}

	/** The grid as text, one row per line. */
	toString(): string {
		const dims = this.dimensions();
		const lastAxis = dims.length - 1;
		const columns = dims[lastAxis];
		const rowCount = this.size() / columns;

		let cellWidth = 0;
		this.#buffer().forEach((value) => {
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
			lines[row] = cells.join(' ');
		}
		return lines.join('\n');
	}
}

export { Matrix };
