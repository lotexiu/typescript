import { LOCALES } from './declarations';

/** The supported locales. */
type TLocales = typeof LOCALES;

/** One supported locale. */
type TLocale = TLocales[number];

/** Message key → text. */
type TLocaleObject = Record<string, string>;

/** Messages per locale. */
type TLocaleMap<T extends TLocaleObject = TLocaleObject> = {
	[key in TLocale]?: T;
};

export { TLocales, TLocale, TLocaleObject, TLocaleMap };
