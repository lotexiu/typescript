import { TChanges, TComponentKey, TComponentValue } from './types';

abstract class Component {
	protected abstract onChange(changes: TChanges<this>): void;

	constructor() {
		let pendingChanges: TChanges<any> = {};
		let scheduled = false;

		const flush = () => {
			scheduled = false;
			const snapshot = pendingChanges;
			pendingChanges = {};
			this.onChange(snapshot);
		};

		return new Proxy(this, {
			set(target, prop: TComponentKey, value: TComponentValue) {
				const oldValue = target[prop];

				if (oldValue !== value) {
					target[prop] = value;

					pendingChanges[prop] = { oldValue, value };

					if (!scheduled) {
						scheduled = true;
						queueMicrotask(flush);
					}
				}

				return true;
			},
		});
	}
}

export { Component };
