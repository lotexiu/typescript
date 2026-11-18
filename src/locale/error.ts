import { TLocaleMap } from './types';
import { LocaleUtils } from './utils';

/**
 * An `Error` whose message comes from a locale map in the current locale; `type` is the message key, stable across languages.
 */
class LocaleError<T extends TLocaleMap> extends Error {
	/** Builds the error from a locale map and a message key; details go in `cause`. */
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
