import { computed } from "../computed/model";
import { model } from "../model/model";
import { TIndexedValue } from "./types";

class ValueHistory<T> {
	private _history: TIndexedValue<T>[] = []
	private indexModel = model(-1)
	
	previous = computed(() => this._history[this.index - 1], [this.indexModel])
	current = computed(() => this._history[this.index], [this.indexModel])
	next = computed(() => this._history[this.index + 1], [this.indexModel])

	get length() { return this._history.length }
	get history() { return [...this._history] }
	get index() { return this.indexModel.value }

	constructor(public cacheSize: number = -1) { }

	undo() {
		if (this.index < 0) return;
		this.indexModel.set(this.index - 1);
	}

	redo() {
		if (this.index >= this.length - 1) return;
		this.indexModel.set(this.index + 1);
	}

	add(value: T) {
		this.indexModel.silentSet(this.index + 1);

		if (this.cacheSize >= 0 && this.index >= this.cacheSize) {
			this._history = this._history.slice(this.index - (this.cacheSize - 1), this.index);
			this.indexModel.silentSet(this.cacheSize - 1);
		} else {
			this._history.length = this.index;
		}

		const state: TIndexedValue<T> = { index: this.index, value }
		this._history.push(state);
		this.indexModel.notifies();
	}
}

export {
	ValueHistory
}