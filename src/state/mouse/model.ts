import { readField } from '@ts/field/model';
import { signal } from '@ts/signal/model';

class MouseState<Buttons extends PropertyKey> {
	// Objetos mutados no lugar + `notify()` — sem alocar a cada movimento/clique.
	readonly position = signal({ x: -1, y: -1 });
	readonly buttons = signal(new Set<Buttons>());
	readonly combo = readField(this.buttons, (buttons) => Array.from(buttons).sort());
	readonly anyPressed = readField(this.buttons, (buttons) => buttons.size > 0);

	move(x: number, y: number): void {
		const position = this.position();
		if (position.x === x && position.y === y) return;
		position.x = x;
		position.y = y;
		this.position.notify();
	}

	press(button: Buttons): void {
		const buttons = this.buttons();
		if (buttons.has(button)) return;
		buttons.add(button);
		this.buttons.notify();
	}

	release(button: Buttons): void {
		const buttons = this.buttons();
		if (!buttons.delete(button)) return;
		this.buttons.notify();
	}

	isPressed(button: Buttons): boolean {
		return this.buttons().has(button);
	}

	reset(): void {
		const buttons = this.buttons();
		if (buttons.size === 0) return;
		buttons.clear();
		this.buttons.notify();
	}
}

export { MouseState };
