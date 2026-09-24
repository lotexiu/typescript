import { signal } from '@ts/signal/model';
import { TReadable, TSignal } from '@ts/signal/types';

class Item<V> {
	readonly value: TSignal<V>;

	constructor(
		readonly id: string,
		readonly label: TReadable<string>,
		initial: V
	) {
		this.value = signal(initial);
	}
}

export { Item };
