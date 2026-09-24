import { TLocaleMap, TLocaleObject } from './types';
import { LocaleUtils } from './utils';

class LocaleError<T extends TLocaleMap> extends Error {
	constructor(
		LocaleMap: T,
		readonly type: keyof T[keyof T],
		options?: { cause?: unknown }
	) {
		const locale = LocaleUtils.getLocaleObject(LocaleMap);
		super(locale[type] as string, options);
	}
}

export { LocaleError };
