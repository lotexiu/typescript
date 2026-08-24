import { Computed, computed } from "@ts/computed/model";
import { Model, model } from "@ts/model/model";
import { Subscription } from "@ts/subscription/model";
import { TButtons, TMousePosition } from "./types";

class MouseState<Buttons extends PropertyKey> extends Subscription<MouseState<Buttons>> {
	position = model({ x: -1, y: -1 })
	buttons: Model<TButtons<Buttons>> = model({})

	combo: Computed<Buttons[]> = computed(() => Object.keys(this.buttons.value).sort() as Buttons[], [this.buttons])
	anyPressed: Computed<boolean> = computed(() => this.combo.value.length > 0, [this.combo])

	constructor() {
		super()
		this.position.subscribe(() => this.notifies(this))
		this.buttons.subscribe(() => this.notifies(this))
	}

	move(x: number, y: number): void {
		const value = this.position.value
		value.x = x
		value.y = y
		this.position.notifies(value)
	}

	press(button: Buttons): void {
		if (this.buttons.value[button]) return
		this.buttons.value[button] = true
		this.buttons.notifies(this.buttons.value)
	}

	release(button: Buttons): void {
		if (!this.buttons.value[button]) return
		delete this.buttons.value[button]
		this.buttons.notifies(this.buttons.value)
	}

	isPressed(button: Buttons): boolean {
		return Boolean(this.buttons.value[button])
	}

	reset(): void {
		this.buttons.set({})
	}
}

export {
	MouseState
}
