import { computed, Computed } from "../computed/model";
import { Subscription } from "../subscription/model";
import { model, Model } from "../model/model";
import { TMouseButton, TMousePosition } from "./types";

class MouseState extends Subscription<MouseState> {
	position: Model<TMousePosition>
	buttons: Model<Partial<Record<TMouseButton, boolean>>> = model({})
	combo: Computed<TMouseButton[]> = computed(
		() => (Object.keys(this.buttons.value) as TMouseButton[]).filter((b) => this.buttons.value[b]).sort(),
		[this.buttons],
	)
	anyPressed: Computed<boolean> = computed(() => this.combo.value.length > 0, [this.combo])

	constructor(initialPosition: TMousePosition = { x: -1, y: -1 }) {
		super()
		this.position = model(initialPosition)
		this.position.subscribe(() => this.notifies(this))
		this.buttons.subscribe(() => this.notifies(this))
	}

	move(x: number, y: number): void {
		const value = this.position.value
		value.x = x
		value.y = y
		this.position.notifies(value)
	}

	press(button: TMouseButton): void {
		if (this.buttons.value[button]) return
		this.buttons.value[button] = true
		this.buttons.notifies(this.buttons.value)
	}

	release(button: TMouseButton): void {
		if (!this.buttons.value[button]) return
		delete this.buttons.value[button]
		this.buttons.notifies(this.buttons.value)
	}

	isPressed(button: TMouseButton): boolean {
		return Boolean(this.buttons.value[button])
	}

	reset(): void {
		this.buttons.set({})
	}
}

export {
	MouseState
}
