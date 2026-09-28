import { describe, it, expect } from 'vitest';
import { LocaleUtils } from '@ts/locale/utils';
import { LocaleError } from '@ts/locale/error';

describe('LocaleUtils.default', () => {
	it('defaults to en-US', () => {
		expect(LocaleUtils.default).toBe('en-US');
	});
});

describe('LocaleUtils.getLocaleObject', () => {
	it('falls back to the default locale when the system locale is not in the map', () => {
		const map = { 'en-US': { hello: 'hi' } } as const;
		expect(LocaleUtils.getLocaleObject(map)).toEqual({ hello: 'hi' });
	});

	it('throws when neither the system locale nor the default locale is present', () => {
		const map = { 'fr-FR': { hello: 'salut' } } as any;
		expect(() => LocaleUtils.getLocaleObject(map)).toThrow('Locale not found');
	});
});

describe('LocaleUtils.supportedLocales', () => {
	it('returns an array no longer than the declared LOCALES list', () => {
		// Intl.DateTimeFormat.supportedLocalesOf canonicalizes tags (e.g. "quz-BO" -> "qu-BO"
		// on some ICU builds), so the result isn't guaranteed to be a literal subset by string
		// identity — only bounded by it.
		const supported = LocaleUtils.supportedLocales();
		expect(Array.isArray(supported)).toBe(true);
		expect(supported.length).toBeLessThanOrEqual(LocaleUtils.locales.length);
	});

	it('includes a well-known locale like en-US', () => {
		expect(LocaleUtils.supportedLocales()).toContain('en-US');
	});
});

describe('LocaleError', () => {
	it('resolves its message from the locale map using the resolved locale object', () => {
		const map = { 'en-US': { broken: 'it broke' } } as const;
		const error = new LocaleError(map, 'broken');
		expect(error).toBeInstanceOf(Error);
		expect(error.message).toBe('it broke');
		expect(error.type).toBe('broken');
	});

	it('forwards the `cause` option', () => {
		const map = { 'en-US': { broken: 'it broke' } } as const;
		const cause = new Error('root cause');
		const error = new LocaleError(map, 'broken', { cause });
		expect(error.cause).toBe(cause);
	});
});
