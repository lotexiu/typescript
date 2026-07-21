import { describe, expect, it, vi } from 'vitest';
import { InteractionPlugin } from '@ts/html/plugins/interaction/model';

describe('InteractionPlugin', () => {
	it('starts as not focused, not touched, not dirty', () => {
		const plugin = new InteractionPlugin();
		expect(plugin.value).toEqual({ focused: false, touched: false, dirty: false });
	});

	it('onFocus sets focused, without affecting touched/dirty', () => {
		const plugin = new InteractionPlugin();
		plugin.onFocus();
		expect(plugin.value).toEqual({ focused: true, touched: false, dirty: false });
	});

	it('onBlur clears focused and sets touched', () => {
		const plugin = new InteractionPlugin();
		plugin.onFocus();
		plugin.onBlur();
		expect(plugin.value).toEqual({ focused: false, touched: true, dirty: false });
	});

	it('onChange sets dirty and only notifies once even if called repeatedly', () => {
		const plugin = new InteractionPlugin();
		const listener = vi.fn();
		plugin.subscribe(listener);

		plugin.onChange();
		plugin.onChange();
		plugin.onChange();

		expect(plugin.value.dirty).toBe(true);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('reset returns to the initial state', () => {
		const plugin = new InteractionPlugin();
		plugin.onFocus();
		plugin.onBlur();
		plugin.onChange();

		plugin.reset();

		expect(plugin.value).toEqual({ focused: false, touched: false, dirty: false });
	});

	it('notifies subscribers on every real state transition', () => {
		const plugin = new InteractionPlugin();
		const seen: boolean[] = [];
		plugin.subscribe((state) => seen.push(state.touched));

		plugin.onFocus();
		plugin.onBlur();

		expect(seen).toEqual([false, true]);
	});
});
