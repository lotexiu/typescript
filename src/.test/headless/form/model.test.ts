import { describe, it, expect } from 'vitest';
import { Form } from '@ts/headless/form/model';
import { Slider } from '@ts/headless/slider/model';
import { Switch } from '@ts/headless/switch/model';
import { Checkbox } from '@ts/headless/checkbox/model';
import { Select } from '@ts/headless/select/model';
import { RadioGroup } from '@ts/headless/radio-group/model';
import { TextField } from '@ts/headless/text-field/model';
import { writable } from '@ts/composables/writable/model';
import { signal } from '@tsr-node/signal/model';

const definitions = {
	roundness: { kind: 'range', label: 'Roundness', default: 1, min: 0, max: 2, step: 0.25 },
	blur: { kind: 'toggle', default: true },
	compact: { kind: 'toggle', default: false, control: 'checkbox' },
	edge: { kind: 'choice', default: 'bottom', options: ['bottom', 'top'], optionLabels: { bottom: 'Bottom edge' } },
	density: { kind: 'choice', default: 'normal', options: ['tight', 'normal'], control: 'radio' },
	name: { kind: 'text', default: '', required: true },
} as const;

describe('Form', () => {
	it('creates one headless control per definition, by kind and control hint', () => {
		const form = new Form({ definitions });
		expect(form.controls.roundness).toBeInstanceOf(Slider);
		expect(form.controls.blur).toBeInstanceOf(Switch);
		expect(form.controls.compact).toBeInstanceOf(Checkbox);
		expect(form.controls.edge).toBeInstanceOf(Select);
		expect(form.controls.density).toBeInstanceOf(RadioGroup);
		expect(form.controls.name).toBeInstanceOf(TextField);
		expect(form.fields.map((field) => field.id)).toEqual(Object.keys(definitions));
		expect(form.controls.edge.collection.label('bottom')).toBe('Bottom edge');
		expect(form.controls.roundness.range).toMatchObject({ min: 0, max: 2, step: 0.25 });
	});

	it('keeps every control and the values record in sync', () => {
		const form = new Form({ definitions, values: { edge: 'top' } });
		expect(form.controls.edge.value()).toBe('top');
		form.controls.roundness.increment();
		form.controls.blur.toggle();
		form.controls.density.choose('tight');
		expect(form.values()).toMatchObject({ roundness: 1.25, blur: false, edge: 'top', density: 'tight' });
		form.assign({ roundness: 0 });
		expect(form.controls.roundness.value()).toBe(0);
		expect(form.dirty()).toBe(true);
		form.reset();
		expect(form.values()).toMatchObject({ roundness: 1, blur: true, edge: 'top', density: 'normal' });
	});

	it('is invalid while a text control has an error', () => {
		const form = new Form({ definitions });
		expect(form.invalid()).toBe(true);
		form.controls.name.input('Ana');
		expect(form.invalid()).toBe(false);
	});

	it('writes into an external source, such as the adjustments of a theme', () => {
		const stored = signal<Record<string, unknown>>({});
		const values = writable(
			() => ({ roundness: 1, blur: true, ...stored() }) as never,
			(next: Record<string, unknown>) => stored.set(next)
		) as never;
		const form = new Form({ definitions: { roundness: definitions.roundness, blur: definitions.blur }, values });
		form.controls.blur.toggle();
		expect(stored()).toEqual({ roundness: 1, blur: false });
	});

	it('refuses invalid defaults and unknown or invalid assignments', () => {
		expect(() => new Form({ definitions: { size: { kind: 'range', default: 9, min: 0, max: 1 } } })).toThrow(expect.objectContaining({ type: 'invalidControl' }));
		const form = new Form({ definitions });
		expect(() => form.assign({ size: 1 } as never)).toThrow(expect.objectContaining({ type: 'undeclaredControl' }));
		expect(() => form.assign({ edge: 'left' as 'top' })).toThrow(expect.objectContaining({ type: 'invalidControl' }));
	});

	it('disables every control at once', () => {
		const disabled = signal(false);
		const form = new Form({ definitions, disabled });
		disabled.set(true);
		expect(form.controls.blur.toggle()).toBe(false);
		expect(form.controls.roundness.parts.thumb().tabindex).toBe(-1);
	});
});
