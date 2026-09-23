import { Computed, computed } from '@ts/computed/model';
import { model } from '@ts/model/model';
import { TPath, TPathValue } from '@tsn-object/types';
import { ObjectUtils } from '@tsn-object/utils';

class Select<
	Raw,
	ValuePath extends TPath<Raw> | undefined,
	LabelPath extends TPath<Raw> | undefined,
> {
	readonly valuePath;
	readonly displayPath;

	readonly list;
	readonly raw;

	readonly value = computed(() => {
		return ObjectUtils.valueFromPath(this.raw.value, this.valuePath.value);
	});
	readonly label = computed(() => {
		return ObjectUtils.valueFromPath(this.raw.value, this.displayPath.value);
	});

	constructor(list: Raw[], initial: Raw, valuePath: ValuePath, displayPath: LabelPath) {
		this.list = model(list);
		this.raw = model(initial);
		this.valuePath = model(valuePath);
		this.displayPath = model(displayPath);
		Computed.setDependencies(this.value, [this.raw, this.valuePath]);
		Computed.setDependencies(this.label, [this.raw, this.displayPath]);
	}
}

export { Select };
