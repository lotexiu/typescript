import { LOCALES } from './declarations';
import { TLocale, TLocaleMap } from './types';

class LocaleUtils {
	static default: TLocale = 'en-US';
	static readonly locales = LOCALES;

	static get SystemLocale(): TLocale {
		return Intl.DateTimeFormat().resolvedOptions().locale as TLocale;
	}

	static supportedLocales() {
		return Intl.DateTimeFormat.supportedLocalesOf(LOCALES);
	}

	static getLocaleObject<T extends TLocaleMap>(locales: T) {
		type PossibleLocaleObject = T[keyof T] | undefined;
		let locale = locales[this.SystemLocale] as PossibleLocaleObject;
		if (!locale) locale = locales[LocaleUtils.default] as PossibleLocaleObject;
		if (!locale) throw new Error('Locale not found');
		return locale;
	}
}

export { LocaleUtils };
