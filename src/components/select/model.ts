import { derived, signal } from '@ts/signal/model';
import { TPath } from '@tsn-object/types';
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

	readonly value = derived(() => ObjectUtils.valueFromPath(this.raw(), this.valuePath()));
	readonly label = derived(() => ObjectUtils.valueFromPath(this.raw(), this.displayPath()));

	constructor(list: Raw[], initial: Raw, valuePath: ValuePath, displayPath: LabelPath) {
		this.list = signal(list);
		this.raw = signal(initial);
		this.valuePath = signal(valuePath);
		this.displayPath = signal(displayPath);
	}
}

export { Select };
