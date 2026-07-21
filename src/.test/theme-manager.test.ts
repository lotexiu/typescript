import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function mockMatchMedia(initialMatches: boolean) {
	let matches = initialMatches;
	let listener: ((event: { matches: boolean }) => void) | undefined;

	vi.stubGlobal('matchMedia', () => ({
		get matches() { return matches; },
		addEventListener: (_: string, fn: (event: { matches: boolean }) => void) => { listener = fn; },
		removeEventListener: () => { listener = undefined; },
	}));

	return {
		fireChange(next: boolean) {
			matches = next;
			listener?.({ matches: next });
		},
	};
}

function mockLocalStorage() {
	const store = new Map<string, string>();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => { store.set(key, value); },
		removeItem: (key: string) => { store.delete(key); },
	});
}

describe('ThemeManager', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('defaults to the system preference when nothing is stored', async () => {
		mockMatchMedia(true);
		mockLocalStorage();
		const { themeManager } = await import('@ts/html/managers/theme/model');

		expect(themeManager.theme).toBe('dark');
	});

	it('prefers a manually stored theme over the system preference', async () => {
		mockMatchMedia(true);
		mockLocalStorage();
		localStorage.setItem('theme', 'light');

		const { themeManager } = await import('@ts/html/managers/theme/model');
		expect(themeManager.theme).toBe('light');
	});

	it('setTheme notifies subscribers and persists the choice', async () => {
		mockMatchMedia(false);
		mockLocalStorage();
		const { themeManager } = await import('@ts/html/managers/theme/model');

		const seen: string[] = [];
		themeManager.add((theme) => seen.push(theme));

		themeManager.setTheme('dark');

		expect(themeManager.theme).toBe('dark');
		expect(seen).toEqual(['dark']);
		expect(localStorage.getItem('theme')).toBe('dark');
	});

	it('toggle flips between light and dark', async () => {
		mockMatchMedia(false);
		mockLocalStorage();
		const { themeManager } = await import('@ts/html/managers/theme/model');
		themeManager.add(() => {});

		themeManager.toggle();
		expect(themeManager.theme).toBe('dark');

		themeManager.toggle();
		expect(themeManager.theme).toBe('light');
	});

	it('follows system preference changes only while subscribed and while no manual choice is stored', async () => {
		const media = mockMatchMedia(false);
		mockLocalStorage();
		const { themeManager } = await import('@ts/html/managers/theme/model');

		const seen: string[] = [];
		const unsubscribe = themeManager.add((theme) => seen.push(theme));

		media.fireChange(true);
		expect(themeManager.theme).toBe('dark');
		expect(seen).toEqual(['dark']);

		unsubscribe();
		media.fireChange(false);

		// depois de cancelar a assinatura, o listener real do matchMedia foi removido.
		expect(themeManager.theme).toBe('dark');
	});

	it('ignores system preference changes once a theme has been manually set', async () => {
		const media = mockMatchMedia(false);
		mockLocalStorage();
		const { themeManager } = await import('@ts/html/managers/theme/model');

		themeManager.add(() => {});
		themeManager.setTheme('light');

		media.fireChange(true);

		expect(themeManager.theme).toBe('light');
	});
});
