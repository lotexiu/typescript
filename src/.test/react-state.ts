console.clear();

const ATTACH = Symbol('attach');

type TAttach<T> = {
	[ATTACH]: T;
};

let counter = 0;
let active: any;

class Model {
	dependents: any[] = [];

	constructor(public value: any) {}

	set(value: any) {
		this.value = value;
		this.dependents.forEach((dep) => dep.dirty());
	}
}


class Computed {
	dependencies: any[] = [];
	dependents: any[] = [];

	id = counter++;

	value: any;

	constructor(public compute: any) {}

	_dirty = true;
	dirty() {
		if (this._dirty) return;
		this._dirty = true;
		this.dependents.forEach((dep) => dep.dirty());
	}

	read() {
		if (this._dirty) {
			this.dependencies = [];
		}
		const prev = active;
		if (prev !== undefined) {
			this.dependents.push(prev);
			prev.dependencies.push(this);
		}
		if (!this._dirty) {
			console.log('cache', this.id, this.value);
			return this.value;
		}
		this._dirty = false;
		active = this;
		this.value = this.compute();
		active = prev;
		return this.value;
	}

	static new(compute: any) {
		const value = new Computed(compute);
		const instance = () => value.read();
		instance[ATTACH] = value;
		return instance;
	}
}

const computeA = Computed.new(() => 1);
const computeB = Computed.new(() => computeA());
const computeC = Computed.new(() => computeA());
const computeD = Computed.new(() => computeA());

console.log('A', computeA());
console.log('B', computeB());
console.log('C', computeC());
console.log('D', computeD());

console.log('b', computeB());

computeA[ATTACH].compute = () => 2;
computeA[ATTACH].dirty();

console.log('dirty');
console.log(computeA());

console.log('b', computeB());
