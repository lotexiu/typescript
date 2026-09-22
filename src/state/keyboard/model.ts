import { readField } from '@ts/field/model';
import { model } from '@ts/model/model';

class KeyboardState<KeyCode> {
	keys = model(new Set<KeyCode>());
	combo = readField(this.keys, () => Array.from(this.keys.value).sort());
	anyPressed = readField(this.keys, (keys) => keys.size > 0);

	press(code: KeyCode): void {
		if (this.keys.value.has(code)) return;
		this.keys.value.add(code);
		this.keys.notifies(this.keys.value);
	}

	release(code: KeyCode): void {
		if (!this.keys.value.has(code)) return;
		this.keys.value.delete(code);
		this.keys.notifies(this.keys.value);
	}

	isPressed(code: KeyCode): boolean {
		return this.keys.value.has(code);
	}

	reset(): void {
		this.keys.value.clear();
		this.keys.notifies(this.keys.value);
	}
}

export { KeyboardState };
