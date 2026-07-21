import { CaptureManager } from "@ts/capture-manager/model";
import { TKeyboardEventCode, TKeyboardOnEvent, TKeyboardValue } from "./types";

class KeyboardManager extends CaptureManager<TKeyboardOnEvent> {	
	private binds = {
		process: this.process.bind(this),
		onBlur: this.onBlur.bind(this),
	}

	protected start(): void {
		document.addEventListener('keydown', this.binds.process);
		document.addEventListener('keyup', this.binds.process);
		window.addEventListener('blur', this.binds.onBlur);
	}

	protected stop(): void {
		document.removeEventListener('keydown', this.binds.process);
		document.removeEventListener('keyup', this.binds.process);
		window.removeEventListener('blur', this.binds.onBlur);
	}

	lastId: number = 0;
	protected register(value: TKeyboardOnEvent) { 
		const id = this.lastId++;
		this.callbackMap.set(id, value);
		return id;
	}

	protected unRegister(id: number): void {
		this.callbackMap.delete(id);
	}

	private comboChanged: boolean = false;
	private currentPressed: Set<TKeyboardEventCode> = new Set();
	private previousPressed: Set<TKeyboardEventCode> = new Set();

	private process(event: KeyboardEvent) {
		this.updateState(event);
		if (!this.hasCallbacks()) return;
		const value = this.buildValue(event);
		for (const fn of this.callbacks()) {
			if (fn(value)) break;
		}
	}

	private onBlur() {
		this.previousPressed = this.currentPressed;
		this.currentPressed = new Set();
	}

	private buildValue(event: KeyboardEvent): TKeyboardValue {
		return {
			key: event.key,
			isDown: event.type === "keydown",
			code: event.code as TKeyboardEventCode,
			target: event.target,
			combo: {
				current: Array.from(this.currentPressed),
				previous: Array.from(this.previousPressed),
			},
			comboChanged: this.comboChanged,
			preventDefault: event.preventDefault.bind(event),
			get defaultPrevented() {
				return event.defaultPrevented;
			},
		}
	}

	private updateState(event: KeyboardEvent) {
		const key = event.code as TKeyboardEventCode;
		const pressed = event.type === "keydown";

		if (this.currentPressed.has(key) === pressed) {
			this.comboChanged = false;
			return;
		};

		this.comboChanged = true;
		this.previousPressed = this.currentPressed;
		const nextPressed = new Set(this.currentPressed);
		if (pressed) nextPressed.add(key)
		else nextPressed.delete(key);
		this.currentPressed = nextPressed;
	}
}

/** Singleton `CaptureManager` tracking which keys are currently held down, active only while someone subscribes via `add()`. */
const keyboardManager = new KeyboardManager();

export {
	keyboardManager
}