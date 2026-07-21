import { CaptureManager } from "@ts/capture-manager/model";
import { TMouseButtons, TMouseButtonsCode, TMouseOnEvent, TMouseValue } from "./types";
import { MOUSE_BUTTON_MAP } from "./declarations";

class MouseManager extends CaptureManager<TMouseOnEvent> {	
	private readonly binds = {
		process: this.process.bind(this),
		onBlur: this.onBlur.bind(this),
	};

	/** Attaches the `mousemove`/`mousedown`/`mouseup`/`blur` listeners that track buttons and position. */
	protected start(): void {
		document.addEventListener('mousemove', this.binds.process);
		document.addEventListener('mousedown', this.binds.process);
		document.addEventListener('mouseup', this.binds.process);
		window.addEventListener('blur', this.binds.onBlur);
	}

	/** Detaches the `mousemove`/`mousedown`/`mouseup`/`blur` listeners. */
	protected stop(): void {
		document.removeEventListener('mousemove', this.binds.process);
		document.removeEventListener('mousedown', this.binds.process);
		document.removeEventListener('mouseup', this.binds.process);
		window.removeEventListener('blur', this.binds.onBlur);
	}

	/** Next id to hand out for a registered callback. */
	lastId: number = 0;
	/** Registers `value` under a fresh numeric id. */
	protected register(value: TMouseOnEvent) {
		const id = this.lastId++;
		this.callbackMap.set(id, value);
		return id;
	}

	/** Unregisters the callback with `id`. */
	protected unRegister(id: number): void {
		this.callbackMap.delete(id);
	}

	private buttonsChanged: boolean = false;
	private currentButtons: Set<TMouseButtonsCode> = new Set();
	private previousButtons: Set<TMouseButtonsCode> = new Set();
	private currX: number = -1;
	private currY: number = -1;
	private prevX: number = -1;
	private prevY: number = -1;

	private process(event: MouseEvent): void {
		this.updateState(event);
		if (!this.hasCallbacks()) return;
		const value = this.buildValue(event);
		for (const fn of this.callbacks()) {
			if (fn(value)) break;
		}
	}

	private onBlur(): void {
		this.previousButtons = this.currentButtons;
		this.currentButtons = new Set();
		this.prevX = this.currX;
		this.prevY = this.currY;
		this.currX = -1;
		this.currY = -1;
	}

	private buildValue(event: MouseEvent): TMouseValue {
		return {
			isMove: event.type === 'mousemove',
			buttons: {
				current: this.combo(this.currentButtons),
				previous: this.combo(this.previousButtons),
			},
			buttonsChanged: this.buttonsChanged,
			coord: {
				x: { current: event.clientX, previous: this.prevX },
				y: { current: event.clientY, previous: this.prevY },
			},
			target: event.target,
			preventDefault: event.preventDefault.bind(event),
			get defaultPrevented() {
				return event.defaultPrevented;
			},
		};
	}

	private combo(buttons: Set<TMouseButtonsCode>): TMouseButtons[] {
		const result: TMouseButtons[] = [];
		for (const key of buttons) {
			result.push(MOUSE_BUTTON_MAP[key] ?? 'Unknown');
		}
		return result;
	}

	private updateState(event: MouseEvent): void {
		const moveEvent = event.type === 'mousemove';

		this.prevX = this.currX;
		this.prevY = this.currY;
		this.currX = event.clientX;
		this.currY = event.clientY;

		if (moveEvent) {
			this.buttonsChanged = false;
			return;
		}

		const button = event.button as TMouseButtonsCode;
		const isDown = event.type === 'mousedown';

		if (this.currentButtons.has(button) === isDown) {
			this.buttonsChanged = false;
			return;
		}

		this.buttonsChanged = true;
		this.previousButtons = this.currentButtons;
		const nextButtons = new Set(this.currentButtons);
		if (isDown) nextButtons.add(button)
		else nextButtons.delete(button);
		this.currentButtons = nextButtons;
	}
}

/** Singleton `CaptureManager` tracking cursor position and held mouse buttons, active only while someone subscribes via `add()`. */
const mouseManager = new MouseManager();

export {
	mouseManager
}