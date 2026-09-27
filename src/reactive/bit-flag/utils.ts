import { Signal } from '@tsr-node/signal/model';

class BitFlagUtils {
	static toggle(this: Signal<number>, ...flags: number[]) {
		this.set(flags.reduce((acc, flag) => acc ^ flag, this()));
	}

	static disable(this: Signal<number>, ...flags: number[]): number {
		return flags.reduce((acc, flag) => acc & ~flag, this());
	}

	static enable(this: Signal<number>, ...flags: number[]): number {
		return flags.reduce((acc, flag) => acc | flag, this());
	}

	static enabled(this: Signal<number>, some: boolean, ...flags: number[]): boolean {
		if (some) return flags.some((flag) => this() & flag);
		return flags.every((flag) => this() & flag);
	}

	static disabled(this: Signal<number>, some: boolean, ...flags: number[]): boolean {
		if (some) return flags.some((flag) => !(this() & flag));
		return flags.every((flag) => !(this() & flag));
	}

	static reset(this: Signal<number>) {
		this.set(0);
	}
}

export { BitFlagUtils };
