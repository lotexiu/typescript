import { _Object } from "@tsn-object/generic/implementations";
import { TObserveTarget, TKeyboardEvent, TKeyboardEventCode, TKeyboardAction, TKeyboardCombo, TKeyboardMapHandlers, UnListener } from "./types";
import { TNullable } from "@ts/types";

export class KeyboardCapture {
	private static binds = {
    onKeyDown: KeyboardCapture.onKeyDown.bind(this),
    onKeyUp: KeyboardCapture.onKeyUp.bind(this),
  }

	/* Capture */
	static _isCapturing: boolean = false;
	static get isCapturing(): boolean {return this._isCapturing};
	static set capture(value: boolean) {
		this._isCapturing = value;
		if (value) {
			document.addEventListener('keydown', this.binds.onKeyDown as any);
			document.addEventListener('keyup', this.binds.onKeyUp as any);
		} else {
			document.removeEventListener('keydown', this.binds.onKeyDown as any);
			document.removeEventListener('keyup', this.binds.onKeyUp as any);
		}
	}

	private static currentKeys: TKeyboardCombo = {};
	private static previousKeys: TKeyboardCombo = {};
	private static handlersMap = new Map<string,TKeyboardMapHandlers>();

	static add(listener: TObserveTarget, ...actions: TKeyboardAction[]): UnListener {
		this.capture = true;
		actions.forEach((action)=>{
			const combo = this.comboString(action.combo);
			this.initializeHandler(combo, listener);
			this.handlersMap.get(combo)!.get(listener)!.push(action);
		})

		return () => {
			actions.forEach((action)=>{
				const combo = this.comboString(action.combo);
				const handlers = this.handlersMap.get(combo);
				if (!handlers) return;

				const listenerActions = handlers.get(listener);
				if (!listenerActions) return;

				const index = listenerActions.indexOf(action);
				if (index > -1) {
					listenerActions.splice(index, 1);
				}

				if (listenerActions.length === 0) {
					handlers.delete(listener);
				}

				if (handlers.size === 0) {
					this.handlersMap.delete(combo);
				}
			});
		}
	}

	private static initializeHandler(combo: string, listener: TObserveTarget) {
		if (!this.handlersMap.has(combo)) {
			this.handlersMap.set(combo, new Map<TObserveTarget, TKeyboardAction[]>());
		}
		if (!this.handlersMap.get(combo)!.has(listener)) {
			this.handlersMap.get(combo)!.set(listener, []);
		}
	}

	private static closestParentWithCombo(element: TObserveTarget, comboMap: TKeyboardMapHandlers) {
		let parent = (element as HTMLElement).parentElement;
		while (parent) {
			if (comboMap.has(parent)) {
				return parent;
			}
			parent = parent.parentElement;
		}
		if (comboMap.has(document)) {
			return document;
		}
		return null;
	}

	private static onKeyDown(event: TKeyboardEvent) {
		this.updatePressedKeys(event.code, true);

		const combo = this.handlersMap.get(this.comboString(this.currentKeys));
		if (!combo) return;

		let target: TNullable<TObserveTarget> = event.target as TObserveTarget;

		if (!combo.has(target)) {
			target = this.closestParentWithCombo(target, combo);
		}
		if (!target) return;

		return combo.get(target)!.forEach((action)=>{
			if (this.isDuplicateTrigger(action)) {
				return;
			}
			action.keyDown?.(event);
		});
	}

	private static isDuplicateTrigger(action: TKeyboardAction) {
		return action.oneCallPerTrigger && this.comboString(this.previousKeys) === this.comboString(this.currentKeys);
	}

	private static onKeyUp(event: TKeyboardEvent) {
		const target = event.target as TObserveTarget;
		this.updatePressedKeys(event.code, false);

		const combo = this.handlersMap.get(this.comboString(this.previousKeys));
		if (!combo) return;

		if (combo.has(target)) {
			return combo.get(target)!.forEach((action)=>{
				action.keyUp?.(event);
			});
		}

		const element = this.closestParentWithCombo(target, combo);

		if (element) {
			return combo.get(element)!.forEach((action)=>{
				action.keyUp?.(event);
			});
		}
	}

	private static comboString(combo: string[]): string;
	private static comboString(combo: TKeyboardCombo): string;
	private static comboString(combo: TKeyboardCombo|string[]): string {
		if (Array.isArray(combo)) {
			return combo.sort().join('+');
		}
		return Object.keys(combo).sort().join('+');
	}

  private static updatePressedKeys(key: TKeyboardEventCode, isDown: boolean) {
		this.previousKeys = { ...this.currentKeys };

		if (isDown && !this.currentKeys[key]) {
			this.currentKeys[key] = true;
		}

		if (!isDown && this.currentKeys[key]) {
			delete this.currentKeys[key];
		}
  }

	static action(
		listener: TObserveTarget,
		combo: TKeyboardEventCode[],
		keyDown?: (event: TKeyboardEvent)=>void,
		keyUp?: (event: TKeyboardEvent)=>void,
		oneCallPerTrigger: boolean = true
	): UnListener {
		return KeyboardCapture.add(listener ,{combo,keyDown,keyUp,oneCallPerTrigger});
	}
}
