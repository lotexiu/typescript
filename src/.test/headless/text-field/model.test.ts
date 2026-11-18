import { describe, it, expect } from 'vitest';
import { TextField } from '@ts/headless/text-field/model';
import { Mask } from '@ts/mask/model';

describe('TextField', () => {
	it('formats with a mask and returns where the caret goes', () => {
		const phone = new TextField({ mask: '(00) 0000-0000' });
		const result = phone.input('119876', 6);
		expect(result.text).toBe('(11) 9876');
		expect(result.caret).toBe(9);
		expect(phone.unmasked()).toBe('119876');
	});

	it('reports the first error as a code and shows it only after the field is touched', () => {
		const phone = new TextField({ mask: '(00) 0000-0000', required: true, id: 'phone' });
		expect(phone.error()).toBe('required');
		expect(phone.showError()).toBe(false);
		phone.focus();
		phone.blur();
		expect(phone.showError()).toBe(true);
		expect(phone.parts.input()).toMatchObject({ 'aria-invalid': 'true', 'aria-describedby': 'phone-error', required: '' });
		phone.input('11987');
		expect(phone.error()).toBe('pattern');
		phone.input('1198765432');
		expect(phone.error()).toBeUndefined();
	});

	it('runs custom validators after the built-in checks', () => {
		const name = new TextField({ validators: [(value) => (value.startsWith(' ') ? 'leadingSpace' : undefined)] });
		name.input(' Ana');
		expect(name.error()).toBe('leadingSpace');
	});

	it('cuts the text at maxLength and exposes it to the input', () => {
		const code = new TextField({ maxLength: 4 });
		expect(code.input('ABCDEF').text).toBe('ABCD');
		expect(code.parts.input().maxlength).toBe(4);
	});

	it('gives the typed value of a number mask', () => {
		const price = new TextField<number>({ mask: Mask.number({ scale: 2, decimal: ',', group: '.' }) });
		price.input('12345');
		expect(price.value()).toBe('123,45');
		expect(price.typed()).toBe(123.45);
	});

	it('keeps the text while disabled and forgets touched on reset', () => {
		const name = new TextField({ value: 'Ana', disabled: true });
		expect(name.input('Bia')).toEqual({ text: 'Ana', caret: 3 });
		name.blur();
		name.reset();
		expect(name.touched()).toBe(false);
	});
});
