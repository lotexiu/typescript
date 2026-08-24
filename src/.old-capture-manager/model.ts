
/**
 * Base class for singletons that manage global browser listeners (`keyboardManager`,
 * `mouseManager`, `hotkey`, `themeManager`) — centralizes the "activate the underlying
 * listener only while someone is subscribed" lifecycle. `add(value)` turns capture on
 * (calling `start()` on the first subscriber) and returns an unsubscribe function that
 * turns it back off (`stop()`) once the last subscriber is gone.
 */
abstract class CaptureManager<T = any, Key = number, Value = T> {
	/** Every registered callback, keyed by whatever `register()` returns as its id. */
	protected callbackMap = new Map<Key, Value>();

	private _isCapturing: boolean = false;
	get capture(): boolean { return this._isCapturing };
	set capture(value: boolean) {
		if (this._isCapturing === value) return;
		this._isCapturing = value;
		value ? this.start() : this.stop();
	}

	/** Attaches the underlying browser listener(s) — called once, on the first subscriber. */
	protected abstract start(): void;
	/** Detaches the underlying browser listener(s) — called once the last subscriber unsubscribes. */
	protected abstract stop(): void;
	/** Optional hook to transform a value before it's registered. */
	protected beforeRegister?: (value: T) => T
	/** Stores `value` in `callbackMap` and returns whatever key(s) `unRegister` will need to remove it later. */
	protected abstract register(value: T): Key | Key[];
	/** Removes a previously `register`ed value by its id(s). */
	protected abstract unRegister(id: Key | Key[], value: T): void;

	/** Subscribes `value`, turning capture on if it's the first subscriber. Returns an unsubscribe function. */
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

	/** All currently registered callback values. */
	callbacks() { return this.callbackMap.values() }
	/** Whether a callback is registered under `key`. */
	has(key: Key) { return this.callbackMap.has(key) }
	/** Whether any callback is currently registered. */
	hasCallbacks() { return this.callbackMap.size > 0 }
	/** Reads the value at `key`, initializing it to `defaultValue` first if absent. */
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