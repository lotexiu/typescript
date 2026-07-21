import { LOCALES } from './declarations';

type TLocales = typeof LOCALES;

type TLocale = TLocales[number];

type TLocaleObject = Record<string, string>;

type TLocaleMap<T extends TLocaleObject = TLocaleObject> = {
	[key in TLocale]?: T;
};

export { TLocales, TLocale, TLocaleObject, TLocaleMap };
