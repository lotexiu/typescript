import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from '@ts/headless/checkbox/model';
import { Switch } from '@ts/headless/switch/model';
import { Disclosure } from '@ts/headless/disclosure/model';
import { signal } from '@tsr-node/signal/model';

describe('Checkbox', () => {
	it('starts unchecked and toggles with Space, preventing the default action', () => {
		const checkbox = new Checkbox();
		const preventDefault = vi.fn();
		expect(checkbox.state()).toBe('unchecked');
		expect(checkbox.keydown({ key: ' ', preventDefault })).toBe(true);
		expect(checkbox.checked()).toBe(true);
		expect(preventDefault).toHaveBeenCalledOnce();
		expect(checkbox.keydown({ key: 'Enter' })).toBe(false);
	});

	it('goes from mixed to checked and describes the state in its attributes', () => {
		const checkbox = new Checkbox({ value: 'mixed', id: 'terms' });
		expect(checkbox.parts.root()).toMatchObject({ id: 'terms', role: 'checkbox', 'aria-checked': 'mixed', 'data-state': 'indeterminate' });
		checkbox.toggle();
		expect(checkbox.value()).toBe(true);
		expect(checkbox.parts.root()['aria-checked']).toBe('true');
	});

	it('ignores user intents while disabled or read-only but still accepts programmatic writes', () => {
		const disabled = signal(true);
		const checkbox = new Checkbox({ disabled });
		expect(checkbox.toggle()).toBe(false);
		expect(checkbox.keydown({ key: ' ' })).toBe(false);
		expect(checkbox.parts.root()).toMatchObject({ tabindex: -1, 'aria-disabled': 'true', 'data-disabled': '' });
		checkbox.set(true);
		expect(checkbox.checked()).toBe(true);
		disabled.set(false);
		expect(checkbox.toggle()).toBe(true);
		expect(new Checkbox({ readOnly: true }).toggle()).toBe(false);
	});

	it('uses an external signal as its value and reports dirty against the initial value', () => {
		const accepted = signal<boolean | 'mixed'>(false);
		const checkbox = new Checkbox({ value: accepted });
		checkbox.check();
		expect(accepted()).toBe(true);
		expect(checkbox.dirty()).toBe(true);
		checkbox.reset();
		expect(accepted()).toBe(false);
		expect(checkbox.dirty()).toBe(false);
	});

	it('lets a reducer change or refuse a transition', () => {
		const checkbox = new Checkbox({ value: true, reducer: (next, current) => (current === true ? current : next) });
		checkbox.toggle();
		expect(checkbox.value()).toBe(true);
	});

	it('keeps its handlers usable after being extracted', () => {
		const { toggle, keydown } = new Checkbox();
		expect(toggle()).toBe(true);
		expect(keydown({ key: ' ' })).toBe(true);
	});
});

describe('Switch', () => {
	it('toggles with Space and Enter and exposes on/off', () => {
		const power = new Switch();
		power.keydown({ key: 'Enter' });
		expect(power.parts.root()).toMatchObject({ role: 'switch', 'aria-checked': 'true', 'data-state': 'on' });
		power.keydown({ key: ' ' });
		expect(power.state()).toBe('off');
	});
});

describe('Disclosure', () => {
	it('links trigger and content and hides the content when closed', () => {
		const details = new Disclosure({ id: 'faq' });
		expect(details.parts.trigger()).toMatchObject({ 'aria-expanded': 'false', 'aria-controls': 'faq-content' });
		expect(details.parts.content()).toMatchObject({ id: 'faq-content', hidden: '' });
		details.toggle();
		expect(details.parts.content().hidden).toBeUndefined();
		expect(details.keydown({ key: 'Escape' })).toBe(true);
		expect(details.value()).toBe(false);
	});
});
