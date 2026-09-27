import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';

class KeyboardState<KeyCode> {
	// O `Set` é mutado no lugar + `notify()` — sem alocar um novo a cada tecla.
	readonly keys = signal(new Set<KeyCode>());
	readonly combo = computed(() => Array.from(this.keys()).sort());
	readonly anyPressed = computed(() => this.keys().size > 0);

	press(code: KeyCode): void {
		const keys = this.keys();
		if (keys.has(code)) return;
		keys.add(code);
		this.keys.notify();
	}

	release(code: KeyCode): void {
		const keys = this.keys();
		if (!keys.delete(code)) return;
		this.keys.notify();
	}

	isPressed(code: KeyCode): boolean {
		return this.keys().has(code);
	}

	reset(): void {
		const keys = this.keys();
		if (keys.size === 0) return;
		keys.clear();
		this.keys.notify();
	}
}

export { KeyboardState };
