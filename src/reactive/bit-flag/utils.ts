import { Signal } from '@tsr-node/signal/model';

class BitFlagUtils {
	static toggle(this: Signal<number>, ...flags: number[]) {
		this.set(flags.reduce((acc, flag) => acc ^ flag, this()));
	}

	static disable(this: Signal<number>, ...flags: number[]) {
		const next =
			flags.length === 1 ? this() & ~flags[0] : flags.reduce((acc, flag) => acc & ~flag, this());
		this.set(next);
	}

	static enable(this: Signal<number>, ...flags: number[]) {
		const next = flags.length === 1 ? this() | flags[0] : flags.reduce((acc, flag) => acc | flag, this());
		this.set(next);
	}

	static enabled(this: Signal<number>, ...flags: number[]): boolean {
		if (flags.length === 1) return Boolean(this() & flags[0]);
		return flags.every((flag) => this() & flag);
	}

	static disabled(this: Signal<number>, ...flags: number[]): boolean {
		if (flags.length === 1) return !(this() & flags[0]);
		return flags.every((flag) => !(this() & flag));
	}

	static reset(this: Signal<number>) {
		this.set(0);
	}
}

export { BitFlagUtils };
