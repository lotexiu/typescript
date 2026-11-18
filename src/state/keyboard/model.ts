import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';

/** Pressed keys as reactive state, fed by an adapter (`press`/`release`) — no DOM listener here. */
class KeyboardState<KeyCode> {
	// O `Set` é mutado no lugar + `notify()` — sem alocar um novo a cada tecla.
	/** Keys currently pressed. */
	readonly keys = signal(new Set<KeyCode>());
	/** Pressed keys, sorted — compare it to detect shortcuts. */
	readonly combo = computed(() => Array.from(this.keys()).sort());
	/** Whether any key is down. */
	readonly anyPressed = computed(() => this.keys().size > 0);

	/** Marks a key as pressed. */
	press(code: KeyCode): void {
		const keys = this.keys();
		if (keys.has(code)) return;
		keys.add(code);
		this.keys.notify();
	}

	/** Marks a key as released. */
	release(code: KeyCode): void {
		const keys = this.keys();
		if (!keys.delete(code)) return;
		this.keys.notify();
	}

	/** Whether a key is pressed. */
	isPressed(code: KeyCode): boolean {
		return this.keys().has(code);
	}

	/** Releases every key (e.g. when the window loses focus). */
	reset(): void {
		const keys = this.keys();
		if (keys.size === 0) return;
		keys.clear();
		this.keys.notify();
	}
}

export { KeyboardState };
