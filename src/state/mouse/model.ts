import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';

/** Pointer position and pressed buttons as reactive state, fed by an adapter. */
class MouseState<Buttons extends PropertyKey> {
	// Objetos mutados no lugar + `notify()` — sem alocar a cada movimento/clique.
	/** Last position (`-1, -1` before any move). */
	readonly position = signal({ x: -1, y: -1 });
	/** Buttons currently pressed. */
	readonly buttons = signal(new Set<Buttons>());
	/** Pressed buttons, sorted. */
	readonly combo = computed(() => Array.from(this.buttons()).sort());
	/** Whether any button is down. */
	readonly anyPressed = computed(() => this.buttons().size > 0);

	/** Records the pointer position. */
	move(x: number, y: number): void {
		const position = this.position();
		if (position.x === x && position.y === y) return;
		position.x = x;
		position.y = y;
		this.position.notify();
	}

	/** Marks a button as pressed. */
	press(button: Buttons): void {
		const buttons = this.buttons();
		if (buttons.has(button)) return;
		buttons.add(button);
		this.buttons.notify();
	}

	/** Marks a button as released. */
	release(button: Buttons): void {
		const buttons = this.buttons();
		if (!buttons.delete(button)) return;
		this.buttons.notify();
	}

	/** Whether a button is pressed. */
	isPressed(button: Buttons): boolean {
		return this.buttons().has(button);
	}

	/** Releases every button. */
	reset(): void {
		const buttons = this.buttons();
		if (buttons.size === 0) return;
		buttons.clear();
		this.buttons.notify();
	}
}

export { MouseState };
