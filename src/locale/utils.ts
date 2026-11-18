import { LOCALES } from './declarations';
import { TLocale, TLocaleMap } from './types';

/** Chooses the locale of the library's messages. */
class LocaleUtils {
	/** Locale used when the system one is not supported. */
	static default: TLocale = 'en-US';
	/** Supported locales. */
	static readonly locales = LOCALES;

	/** The system/browser locale when supported, otherwise `default`. */
	static get SystemLocale(): TLocale {
		return Intl.DateTimeFormat().resolvedOptions().locale as TLocale;
	}

	/** Supported locales. */
	static supportedLocales() {
		return Intl.DateTimeFormat.supportedLocalesOf(LOCALES);
	}

	/** The messages of the current locale from a locale map. */
	static getLocaleObject<T extends TLocaleMap>(locales: T) {
		type PossibleLocaleObject = T[keyof T] | undefined;
		let locale = locales[this.SystemLocale] as PossibleLocaleObject;
		if (!locale) locale = locales[LocaleUtils.default] as PossibleLocaleObject;
		if (!locale) throw new Error('Locale not found');
		return locale;
	}
}

export { LocaleUtils };
