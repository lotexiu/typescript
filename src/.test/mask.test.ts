import { describe, expect, it } from 'vitest';
import { MaskUtils } from '@ts/mask/utils';

describe('Mask', () => {
	it('applies partial CPF mask while typing', () => {
		expect(MaskUtils.apply('067976', '000.000.000-00')).toBe('067.976');
		expect(MaskUtils.apply('067.9760', '000.000.000-00')).toBe('067.976.0');
		expect(MaskUtils.apply('067.976.0000', '000.000.000-00')).toBe('067.976.000-0');
		expect(MaskUtils.apply('067.976.000-00', '000.000.000-00')).toBe('067.976.000-00');
	});

	it('removes mask from mixed masked or malformed values', () => {
		expect(MaskUtils.unapply('067.976.000-00', '000.000.000-00')).toBe('06797600000');
		expect(MaskUtils.unapply('067.976.00000', '000.000.000-00')).toBe('06797600000');
		expect(MaskUtils.unapply('06x7.9a76.0b00-00', '000.000.000-00')).toBe('06797600000');
	});

	it('validates full values and supports strict apply mode', () => {
		expect(MaskUtils.isValid('067.976.000-00', '000.000.000-00')).toBe(true);
		expect(MaskUtils.isValid('067.976', '000.000.000-00')).toBe(false);

		expect(MaskUtils.apply('067976', '000.000.000-00', { applyWhenValid: true })).toBe('067976');
		expect(MaskUtils.apply('06797600000', '000.000.000-00', { applyWhenValid: true })).toBe('067.976.000-00');
	});

	it('supports quantifiers (*, ?, {n,m}) in core engine', () => {
		expect(MaskUtils.apply('12345678900', '0{3}.0{3}.0{3}-0{2}')).toBe('123.456.789-00');

		expect(MaskUtils.apply('1234', '0*')).toBe('1234');
		expect(MaskUtils.apply('1234', '0{2,3}')).toBe('123');
		expect(MaskUtils.apply('a', 'A?0')).toBe('a');
		expect(MaskUtils.apply('7', 'A?0')).toBe('7');

		expect(MaskUtils.isValid('1234', '0*')).toBe(true);
		expect(MaskUtils.isValid('123', '0{2,3}')).toBe(true);
		expect(MaskUtils.isValid('1', '0{2,3}')).toBe(false);

		expect(MaskUtils.unapply('12a34', '0*')).toBe('1234');
		expect(MaskUtils.unapply('AB-12', 'A{2}-0{2}')).toBe('AB12');
	});

	it('supports alternatives and escaped pipes', () => {
		expect(MaskUtils.apply('11987654321', '(00) 00000-0000||(00) 0000-0000')).toBe('(11) 98765-4321');
		expect(MaskUtils.apply('1132654321', '(00) 00000-0000||(00) 0000-0000')).toBe('(11) 3265-4321');

		expect(MaskUtils.apply('12||34', '0{2}\\|\\|0{2}')).toBe('12||34');
		expect(MaskUtils.unapply('12||34', '0{2}\\|\\|0{2}')).toBe('1234');
		expect(MaskUtils.isValid('12||34', '0{2}\\|\\|0{2}')).toBe(true);
	});

	it('supports custom token registration and compile cache', () => {
		const firstCompile = MaskUtils.compile('000-000');
		const secondCompile = MaskUtils.compile('000-000');
		expect(firstCompile).toBe(secondCompile);

		MaskUtils.registerToken('#', (char) => /[0-9a-f]/i.test(char), 'hexadecimal');

		expect(MaskUtils.getTokenKeys()).toContain('#');
		expect(MaskUtils.apply('af10', '##:##')).toBe('af:10');
		expect(MaskUtils.unapply('af:10', '##:##')).toBe('af10');
		expect(MaskUtils.isValid('af:10', '##:##')).toBe(true);

		const removed = MaskUtils.unregisterToken('#');
		expect(removed).toBe(true);
		expect(MaskUtils.getTokenKeys()).not.toContain('#');
	});
});

describe('Mask.caretPositionAfterFormat', () => {
	const CPF = '000.000.000-00';

	it('keeps the caret right after the same amount of typed digits when nothing changed', () => {
		const display = '111.444.777-35';
		// Caret logo depois do 3º dígito, antes do ponto.
		expect(MaskUtils.caretPositionAfterFormat(display, 3, display, CPF)).toBe(4);
		// Caret logo depois do ponto — mesma contagem de dígitos (3), então
		// cai na mesma posição: o caret nunca fica preso entre literais.
		expect(MaskUtils.caretPositionAfterFormat(display, 4, display, CPF)).toBe(4);
		// Caret logo depois do 4º dígito (dentro do segundo grupo).
		expect(MaskUtils.caretPositionAfterFormat(display, 5, display, CPF)).toBe(5);
	});

	it('advances the caret past a newly-inserted literal when a digit is typed right before it', () => {
		// Estado bruto do input logo após o browser inserir o novo dígito
		// (ainda com a formatação antiga, "067.9760", caret no fim) — depois
		// de reaplicar a máscara ("067.976.0"), o caret deve continuar no fim.
		expect(MaskUtils.caretPositionAfterFormat('067.9760', 8, '067.976.0', CPF)).toBe(9);
	});

	it('snaps the caret to the end when the value got shorter than the target position', () => {
		expect(MaskUtils.caretPositionAfterFormat('111.444.777-35', 14, '111.444', CPF)).toBe(7);
	});

	it('places the caret at the very start when nothing precedes it', () => {
		expect(MaskUtils.caretPositionAfterFormat('111.444.777-35', 0, '111.444.777-35', CPF)).toBe(0);
	});
});
