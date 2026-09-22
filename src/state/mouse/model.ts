import { model } from '@ts/model/model';
import { readField } from '@ts/field/model';

class MouseState<Buttons extends PropertyKey> {
	position = model({ x: -1, y: -1 });
	buttons = model(new Set<Buttons>());
	combo = readField(this.buttons, () => Array.from(this.buttons.value).sort());
	anyPressed = readField(this.buttons, (buttons) => buttons.size > 0);

	move(x: number, y: number): void {
		const value = this.position.value;
		value.x = x;
		value.y = y;
		this.position.notifies(value);
	}

	press(button: Buttons): void {
		if (this.buttons.value.has(button)) return;
		this.buttons.value.add(button);
		this.buttons.notifies(this.buttons.value);
	}

	release(button: Buttons): void {
		if (!this.buttons.value.has(button)) return;
		this.buttons.value.delete(button);
		this.buttons.notifies(this.buttons.value);
	}

	isPressed(button: Buttons): boolean {
		return this.buttons.value.has(button);
	}

	reset(): void {
		this.buttons.value.clear();
		this.buttons.notifies(this.buttons.value);
	}
}

export { MouseState };
