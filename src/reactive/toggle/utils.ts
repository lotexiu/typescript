import { Signal } from '@tsr-node/signal/model';

class ToggleUtils {
	static on(this: Signal<boolean>): void {
		this.set(true);
	}

	static off(this: Signal<boolean>): void {
		this.set(false);
	}

	static toggle(this: Signal<boolean>): void {
		this.update((value) => !value);
	}
}

export { ToggleUtils };
