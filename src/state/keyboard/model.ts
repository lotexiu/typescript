import { Computed, computed } from "@ts/computed/model";
import { Model, model } from "@ts/model/model";
import { Subscription } from "@ts/subscription/model";
import { TKeyCode } from "./types";


class KeyboardState extends Subscription<KeyboardState> {
	keys: Model<Partial<Record<TKeyCode, boolean>>> = model({})
	combo: Computed<TKeyCode[]> = computed(() => Object.keys(this.keys.value).sort() as TKeyCode[], [this.keys])
	anyPressed: Computed<boolean> = computed(() => this.combo.value.length > 0, [this.combo])

	constructor() {
		super()
		this.keys.subscribe(() => this.notifies(this))
	}

	press(code: TKeyCode): void {
		if (this.keys.value[code]) return
		this.keys.value[code] = true
		this.keys.notifies(this.keys.value)
	}

	release(code: TKeyCode): void {
		if (!this.keys.value[code]) return
		delete this.keys.value[code]
		this.keys.notifies(this.keys.value)
	}

	isPressed(code: TKeyCode): boolean {
		return Boolean(this.keys.value[code])
	}

	reset(): void {
		this.keys.set({})
	}
}

export {
	KeyboardState
}
