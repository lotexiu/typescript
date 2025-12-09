import { _Object } from "@tsn-object/generic/implementations";
import { TObserveTarget, TKeyboardEvent, TKeyboardEventCode, TKeyboardAction, TKeyboardCombo, TKeyboardMapHandlers, UnListener } from "./types";
import { TNullable } from "@ts/types";

export class KeyboardCapture {
	private static binds = {
    onKeyDown: KeyboardCapture.onKeyDown.bind(this),
    onKeyUp: KeyboardCapture.onKeyUp.bind(this),
		clearPressedKeys: KeyboardCapture.clearPressedKeys.bind(this),
  }

	/* Capture */
	private static _isCapturing: boolean = false;
	static get isCapturing(): boolean {return this._isCapturing};
	static set capture(value: boolean) {
		this._isCapturing = value;
		if (value) {
			document.addEventListener('keydown', this.binds.onKeyDown as any);
			document.addEventListener('keyup', this.binds.onKeyUp as any);
			window.addEventListener('blur', this.binds.clearPressedKeys as any); // Prevent stuck keys from custom browser shortcuts
		} else {
			document.removeEventListener('keydown', this.binds.onKeyDown as any);
			document.removeEventListener('keyup', this.binds.onKeyUp as any);
			window.removeEventListener('blur', this.binds.clearPressedKeys as any);
		}
	}

	private static currentKeys: TKeyboardCombo = {};
	private static previousKeys: TKeyboardCombo = {};
	static readonly handlersMap = new Map<string,TKeyboardMapHandlers>();

	static add(listener: TObserveTarget, ...actions: TKeyboardAction[]): UnListener {
		this.capture = true;
		actions.forEach((action)=>{
			if (!Array.isArray(action.combo[0])){
				action.combo = [action.combo as TKeyboardEventCode[]];
			}
			(action.combo as TKeyboardEventCode[][]).forEach((comboArray)=>{
				const combo = this.comboString(comboArray);
				this.initializeHandler(combo, listener);
				this.handlersMap.get(combo)!.get(listener)!.push(action);
			})
		})

		return () => {
			actions.forEach((action)=>{
				if (!Array.isArray(action.combo[0])){
					action.combo = [action.combo as TKeyboardEventCode[]];
				}
				(action.combo as TKeyboardEventCode[][]).forEach((comboArray)=>{
					const combo = this.comboString(comboArray);
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
				})
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

		const comboString = this.comboString(this.currentKeys);
		const combo = this.handlersMap.get(comboString);
		if (!combo) return;

		let target: TNullable<TObserveTarget> = event.target as TObserveTarget;

		if (!combo.has(target)) {
			target = this.closestParentWithCombo(target, combo);
		}
		if (!target) return;

		event.preventDefault();
		event.stopPropagation();
		return combo.get(target)!.forEach((action)=>{
			if (this.isDuplicateTrigger(action)) {
				return;
			}
			action.keyDown?.({event, combo: this.comboArray(comboString)});
		});
	}

	private static isDuplicateTrigger(action: TKeyboardAction) {
		return action.oneCallPerTrigger && this.comboString(this.previousKeys) === this.comboString(this.currentKeys);
	}

	private static onKeyUp(event: TKeyboardEvent) {
		this.updatePressedKeys(event.code, false);

		const comboString = this.comboString(this.previousKeys);
		const combo = this.handlersMap.get(comboString);
		if (!combo) return;

		let target: TNullable<TObserveTarget> = event.target as TObserveTarget;

		if (!combo.has(target)) {
			target = this.closestParentWithCombo(target, combo);
		}

		if (!target) return;
		event.preventDefault();
		event.stopPropagation();

		return combo.get(target)!.forEach((action)=>{
			action.keyUp?.({event, combo: this.comboArray(comboString)});
		});
	}

	private static comboString(combo: string[]): string;
	private static comboString(combo: TKeyboardCombo): string;
	private static comboString(combo: TKeyboardCombo|string[]): string {
		if (Array.isArray(combo)) {
			return combo.sort().join('+');
		}
		return Object.keys(combo).sort().join('+');
	}

	private static comboArray(combo: string): TKeyboardEventCode[] {
		return combo.split('+') as TKeyboardEventCode[];
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

	private static clearPressedKeys() {
		this.currentKeys = {};
		this.previousKeys = {};
	}

	static action(
		listener: TObserveTarget,
		combo: TKeyboardAction['combo'],
		keyDown?: TKeyboardAction['keyDown'],
		keyUp?: TKeyboardAction['keyUp'],
		oneCallPerTrigger: boolean = true
	): UnListener {
		return KeyboardCapture.add(listener ,{combo: combo,keyDown,keyUp,oneCallPerTrigger});
	}
}
