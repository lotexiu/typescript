import { readField } from '@ts/field/model';
import { signal } from '@ts/signal/model';

class KeyboardState<KeyCode> {
	// O `Set` é mutado no lugar + `notify()` — sem alocar um novo a cada tecla.
	readonly keys = signal(new Set<KeyCode>());
	readonly combo = readField(this.keys, (keys) => Array.from(keys).sort());
	readonly anyPressed = readField(this.keys, (keys) => keys.size > 0);

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
