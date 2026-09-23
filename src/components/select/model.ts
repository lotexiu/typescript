import { computed } from '@ts/computed/model';
import { model } from '@ts/model/model';
import { TPath } from '@tsn-object/types';
import { ObjectUtils } from '@tsn-object/utils';

class Select<Raw, ValuePath extends TPath<Raw>, DisplayPath extends TPath<Raw>> {
	readonly valuePath = model<ValuePath | undefined>(undefined);
	readonly displayPath = model<DisplayPath | undefined>(undefined);

	readonly list = model<Raw[]>([]);
	readonly raw = model<Raw | undefined>(undefined);

	readonly value = computed(() => {
		if (!this.raw.value || !this.valuePath.value) return;
		return ObjectUtils.valueFromPath<Raw, ValuePath>(this.raw.value, this.valuePath.value);
	}, [this.raw, this.valuePath]);

	readonly display = computed(() => {
		if (!this.raw.value || !this.displayPath.value) return;
		return ObjectUtils.valueFromPath<Raw, DisplayPath>(this.raw.value, this.displayPath.value);
	}, [this.raw, this.displayPath]);

	constructor(initial: Raw, valuePath: ValuePath, displayPath: DisplayPath) {
		this.raw.set(initial);
		this.valuePath.set(valuePath);
		this.displayPath.set(displayPath);
	}
}

export { Select };
