import { keyboardManager } from "../keyboard/model";
import { TKeyboardEventCode, TKeyboardValue } from "../keyboard/types";
import { TMouseButtons, TMouseValue } from "../mouse/types";
import { TFn } from "@tsn-function/types";
import { mouseManager } from "../mouse/model";
import { THotkeyCombo, THotkeyData, THotkeyElementValidator, THotkeyEvent, THotkeyMatchData } from "./types";
import { CaptureManager } from "@ts/capture-manager/model";

class HotkeyManager extends CaptureManager<THotkeyData, string, THotkeyData[]> {
	private bindings = {
		onKeyboard: this.onKeyboard.bind(this),
		onMouse: this.onMouse.bind(this),
		process: this.process.bind(this),
		triggerPreviousHotkeys: this.triggerPreviousHotkeys.bind(this),
		triggerUntriggeringHotkeys: this.triggerUntriggeringHotkeys.bind(this),
		triggerMatchingHotkeys: this.triggerMatchingHotkeys.bind(this),
	}

	private readonly documentElementMatcher = (target: EventTarget | null): boolean => target === document;
	private prevComboStr: string = "";
	private comboStr: string = "";
	private combo: THotkeyCombo = [];
	private currentKeyboard: TKeyboardEventCode[] = [];
	private currentMouse: TMouseButtons[] = [];
	private actives: THotkeyData[] = [];
	private keyboardUnregister?: TFn;
	private mouseUnregister?: TFn;

	/** Subscribes to `keyboardManager`/`mouseManager` to track the currently held combo. */
	protected start(): void {
		this.keyboardUnregister = keyboardManager.add(this.bindings.onKeyboard);
		this.mouseUnregister = mouseManager.add(this.bindings.onMouse);
	}

	/** Unsubscribes from `keyboardManager`/`mouseManager`. */
	protected stop(): void {
		this.keyboardUnregister?.();
		this.mouseUnregister?.();
	}

	/** Registers `data` under every combo string it declares (defaulting `element` to the whole document). */
	protected register(data: THotkeyData) {
		data.element = data.element || this.documentElementMatcher;
		return data.combos.map(comboArr => {
			const combo = comboArr.sort().join("+");
			this.get(combo, []).push(data);
			return combo;
		});
	}

	/** Removes `data` from one or more combo bindings. */
	protected unRegister(combos: string | string[], data: THotkeyData): void {
		if (Array.isArray(combos)) {
			return combos.forEach(combo => this.removeFromCombo(combo, data));
		}
		return this.removeFromCombo(combos, data);
	}

	private removeFromCombo(combo: string, data: THotkeyData) {
		const bindings = this.get(combo, []);
		const index = bindings.indexOf(data);
		if (index !== -1) bindings.splice(index, 1);
		if (bindings.length === 0) this.callbackMap.delete(combo);
	}

	private onKeyboard(event: TKeyboardValue) {
		if (event.comboChanged) {
			this.currentKeyboard = event.combo.current;
			this.combo = [...this.currentKeyboard, ...this.currentMouse].sort();
			this.comboStr = this.combo.join("+");
		}
		this.bindings.process(event);
	}

	private onMouse(event: TMouseValue) {
		if (event.buttonsChanged) {
			this.currentMouse = event.buttons.current;
			this.combo = [...this.currentKeyboard, ...this.currentMouse].sort();
			this.comboStr = this.combo.join("+");
		}
		this.bindings.process(event);
	}

	private process(event: THotkeyEvent): void {
		if (!this.hasCallbacks()) return;
		if (this.comboStr == this.prevComboStr) {
			const value = this.buildValue(event, this.combo);
			this.bindings.triggerPreviousHotkeys(value, event);
			return;
		};
		this.prevComboStr = this.comboStr;
		const value = this.buildValue(event, this.combo);
		this.bindings.triggerUntriggeringHotkeys(value, event);
		this.bindings.triggerMatchingHotkeys(this.comboStr, value, event);
	}

	/** Calls `untrigger` on every hotkey active from the previous combo, then clears the active list. */
	triggerUntriggeringHotkeys(value: THotkeyMatchData, event: THotkeyEvent): void {
		this.actives.forEach(active => active.untrigger?.(value));
		this.actives = [];
	}

	/** Re-triggers still-active hotkeys when the combo hasn't changed (e.g. repeated mouse move). */
	triggerPreviousHotkeys(value: THotkeyMatchData, event: THotkeyEvent): void {
		this.actives.forEach(active => {
			if (
				(active.alternate && !active.triggerOnMouseMove) ||
				(active.triggerOnMouseMove && !('isMove' in event && event.isMove))
			) return;
			active.trigger(value);
		})
	}

	/** Triggers every hotkey bound to `comboStr` whose target element is closest to the event target. */
	triggerMatchingHotkeys(comboStr: string, value: THotkeyMatchData, event: THotkeyEvent): void {
		const datas = this.callbackMap.get(comboStr);
		if (!datas) return;
		/* Filtering */
		let lowestDistance = Infinity;
		let activeHotkeys: THotkeyData[] = []
		datas.forEach(data => {
			const distance = this.getDistanceToTarget(event.target, data.element!);
			if (distance > lowestDistance) return;
			if (distance < lowestDistance) {
				lowestDistance = distance;
				activeHotkeys = [];
			}
			activeHotkeys.push(data);
		})
		/* Triggering */
		for (const data of activeHotkeys) {
			this.actives.push(data);
			if (data.trigger(value) == false) return;
		}
	}

	/** Number of DOM-tree hops from `target` up to the nearest ancestor `elementValidator` accepts, or `Infinity` if none matches. */
	getDistanceToTarget(target: EventTarget | null, elementValidator: THotkeyElementValidator): number {
		let distance = 0;
		while (target) {
			if (!(target instanceof Node)) return Infinity;
			if (elementValidator(target)) return distance;
			target = target.parentNode;
			distance++;
		}
		return Infinity;
	}

	/** Builds the match-data payload (event, combo, `preventDefault`) passed to a hotkey's `trigger`/`untrigger`. */
	buildValue(event: THotkeyEvent, combo: THotkeyCombo): THotkeyMatchData {
		return {
			event,
			combo,
			isKeyboardEvent: 'key' in event,
			isMouseEvent: 'buttons' in event,
			preventDefault: () => {
				if (!event.defaultPrevented) event.preventDefault();
			},
			get defaultPrevented() {
				return event.defaultPrevented;
			},
		}
	}
}

/** Singleton `CaptureManager` combining keyboard + mouse state to trigger callbacks on key/button combos, picking the closest matching bound element when several combos tie. */
const hotkey = new HotkeyManager();

export {
	hotkey
}