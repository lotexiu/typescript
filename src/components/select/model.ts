import { computed } from '@ts/computed/model';
import { field } from '@ts/field/model';
import { model } from '@ts/model/model';
import { TPath, TPathValue } from '@tsn-object/types';
import { ObjectUtils } from '@tsn-object/utils';

class Select<Raw, ValuePath extends TPath<Raw>, DisplayPath extends TPath<Raw>> {
	readonly valuePath = model<ValuePath | undefined>(undefined);
	readonly displayPath = model<DisplayPath | undefined>(undefined);

	readonly list = model<Raw[]>([])
	readonly raw = model<Raw | undefined>(undefined);

	readonly value = field(
		this.raw,
		() => {
			if (!this.raw.value || !this.valuePath.value) return;
			return ObjectUtils.valueFromPath(this.raw.value, this.valuePath.value);
		},
		() => {
			if (!this.list.value || !this.valuePath.value) return;
			this.raw.set(this.list.value.find((item) => ObjectUtils.valueFromPath(item, this.valuePath.value!) === this.value.value))
		},
		[this.valuePath]
	);

	readonly display = field(
		this.raw,
		() => {
			if (!this.raw.value || !this.displayPath.value) return;
			return ObjectUtils.valueFromPath(this.raw.value, this.displayPath.value);
		},
		() => {
			if (!this.list.value || !this.displayPath.value) return;
			this.raw.set(this.list.value.find((item) => ObjectUtils.valueFromPath(item, this.displayPath.value!) === this.display.value))
		},
		[this.displayPath]
	);

	constructor(initial: Raw, valuePath: ValuePath, displayPath: DisplayPath) {
		this.raw.set(initial);
		this.valuePath.set(valuePath);
		this.displayPath.set(displayPath);
	}
}

const a = new Select({ a: 2, c: '' }, 'a', 'a');
const c = a.value.value;

export { Select };
