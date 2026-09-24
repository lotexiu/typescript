import { TSubscription, TValueUnsubscribe } from '@ts/subscription/types';
import { Subscription } from '../subscription/model';

class Computed<T> extends Subscription<Computed<T>> {
	#dependencies: TSubscription[];
	#unsubscribes!: TValueUnsubscribe[];
	readonly #compute: () => T;
	#changed = true;
	#value!: T;
	#prevValue?: T;

	constructor(compute: () => T, dependencies: TSubscription[] = []) {
		super();
		this.#compute = compute;
		this.#dependencies = dependencies;
		this.#watch();
	}

	#tryUpdate() {
		if (!this.#changed) return;
		this.#changed = false;
		this.#prevValue = this.#value;
		this.#value = this.#compute();
	}

	get prevValue() {
		this.#tryUpdate();
		return this.#prevValue;
	}

	get value() {
		this.#tryUpdate();
		return this.#value;
	}

	dispose(): void {
		this.#unsubscribe();
		super.dispose();
	}

	#unsubscribe() {
		if (!this.#unsubscribes.length) return;
		this.#unsubscribes.forEach((unsubscribe) => unsubscribe());
	}

	#watch() {
		this.#unsubscribes = this.#dependencies.map((dep) =>
			dep.subscribe(() => {
				this.#changed = true;
				this.notifies(this);
			})
		);
	}

	static setDependencies(computed: Computed<any>, args: any[]) {
		computed.#dependencies = args;
		computed.#unsubscribe();
		computed.#watch();
	}
}

function computed<T>(compute: () => T, dependencies?: TSubscription[]) {
	return new Computed(compute, dependencies);
}

export { Computed, computed };
