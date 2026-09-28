import { describe, it, expect, vi } from 'vitest';
import { inputField } from '@ts/headless/input-field/model';

describe('inputField (unmasked)', () => {
	it('starts empty and updates `display`/`raw`/`value` as text is typed', () => {
		const field = inputField();
		field.setText('hello');
		expect(field.display()).toBe('hello');
		expect(field.raw()).toBe('hello');
		expect(field.value()).toBe('hello');
	});

	it('applies `initial` through `format`/`setValue` at creation', () => {
		const field = inputField<number>({
			initial: 5,
			parse: (raw) => Number(raw) || 0,
			format: (v) => String(v),
		});
		expect(field.display()).toBe('5');
		expect(field.value()).toBe(5);
	});

	it('setValue() reformats `display` and updates `value`', () => {
		const field = inputField<number>({ parse: (raw) => Number(raw) || 0, format: (v) => String(v) });
		field.setValue(42);
		expect(field.display()).toBe('42');
		expect(field.value()).toBe(42);
	});
});

describe('inputField (masked)', () => {
	it('formats digits as they are typed, following the mask pattern', () => {
		const field = inputField({ mask: '000.000.000-00' });
		field.setText('123456789');
		expect(field.display()).toBe('123.456.789');
		expect(field.raw()).toBe('123456789');
	});

	it('accepts typing that includes the mask\'s own literal characters (re-typing over `display`)', () => {
		const field = inputField({ mask: '000.000.000-00' });
		field.setText('123');
		expect(field.display()).toBe('123'); // Mask.apply only adds a trailing literal once more data follows it
		field.setText(field.display() + '4');
		expect(field.display()).toBe('123.4');
	});

	it('setValue() applies the mask to a raw value coming from `format`', () => {
		const field = inputField({ mask: '000.000.000-00', format: (v: string) => v });
		field.setValue('12345678900');
		expect(field.display()).toBe('123.456.789-00');
	});
});

describe('inputField.settledValue', () => {
	it('lags behind `value` until `debounce` elapses', () => {
		vi.useFakeTimers();
		const field = inputField({ debounce: 100 });
		field.setText('a');
		field.setText('ab');
		expect(field.value()).toBe('ab');
		expect(field.settledValue()).toBe('');
		vi.advanceTimersByTime(100);
		expect(field.settledValue()).toBe('ab');
		vi.useRealTimers();
	});
});

describe('inputField.disabled / showPassword', () => {
	it('defaults `disabled` to false and honors an initial value', () => {
		expect(inputField().disabled()).toBe(false);
		expect(inputField({ disabled: true }).disabled()).toBe(true);
	});

	it('exposes a shared `showPassword` toggle regardless of field type', () => {
		const field = inputField();
		expect(field.showPassword()).toBe(false);
		field.showPassword.on();
		expect(field.showPassword()).toBe(true);
	});
});
