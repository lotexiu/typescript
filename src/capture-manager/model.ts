
/**
 * Base class for singletons that manage global browser listeners (`keyboardManager`,
 * `mouseManager`, `hotkey`, `themeManager`) — centralizes the "activate the underlying
 * listener only while someone is subscribed" lifecycle. `add(value)` turns capture on
 * (calling `start()` on the first subscriber) and returns an unsubscribe function that
 * turns it back off (`stop()`) once the last subscriber is gone.
 */
abstract class CaptureManager<T = any, Key = number, Value = T> {
	protected callbackMap = new Map<Key, Value>();

	private _isCapturing: boolean = false;
	get capture(): boolean { return this._isCapturing };
	set capture(value: boolean) {
		if (this._isCapturing === value) return;
		this._isCapturing = value;
		value ? this.start() : this.stop();
	}

	protected abstract start(): void;
	protected abstract stop(): void;
	protected beforeRegister?: (value: T) => T
	protected abstract register(value: T): Key | Key[];
	protected abstract unRegister(id: Key | Key[], value: T): void;

	add(value: T) {
		this.capture = true;
		const newValue = this.beforeRegister?.(value) ?? value;
		const id = this.register(newValue);
		return () => {
			this.unRegister(id, newValue);
			if (this.callbackMap.size > 0) return;
			this.capture = false;
		}
	}

	callbacks() { return this.callbackMap.values() }
	has(key: Key) { return this.callbackMap.has(key) }
	hasCallbacks() { return this.callbackMap.size > 0 }
	get(key: Key, defaultValue: Value) { 
		let value = this.callbackMap.get(key);
		if (!value) {
			this.callbackMap.set(key, defaultValue);
			value = defaultValue;
		}
		return value;
	}
}

export {
	CaptureManager
}