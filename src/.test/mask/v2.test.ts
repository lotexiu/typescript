import { beforeEach, describe, expect, it } from 'vitest';
import { Mask } from '@ts/mask/model';
import { MaskEngine } from '@ts/mask/engine/model';
import { MaskCheckUtils } from '@ts/mask/checks/utils';
import type { TMaskCheck, TMaskNumber } from '@ts/mask/types';
import vectors from '../../../vectors/mask.json';

beforeEach(() => Mask.resetRulesToDefault());

describe('padrão da direita para a esquerda (reversed)', () => {
	for (const v of vectors['pattern-reversed']) {
		it(v.name, () => {
			expect(Mask.apply(v.input, v.pattern, { reversed: v.reversed })).toBe(v.masked);
		});
	}

	it('unapply também lê da direita (mesmos dígitos, mesma ordem)', () => {
		expect(Mask.unapply('1.234.567', '0{1,3}.0{3}.0{3}', { reversed: true })).toBe('1234567');
	});

	it('reaplicar um valor já mascarado não muda nada (idempotente)', () => {
		const once = Mask.apply('1234567', '0{1,3}.0{3}.0{3}', { reversed: true });
		expect(Mask.apply(once, '0{1,3}.0{3}.0{3}', { reversed: true })).toBe(once);
	});
});

describe("preset 'duration-clock'", () => {
	const clock = Mask.of<number>('duration-clock');

	for (const v of vectors['duration-clock']) {
		it(`${v.input} → ${v.masked}${v.note ? ` (${v.note})` : ''}`, () => {
			const parsed = clock.parse(v.input);
			expect(parsed.masked).toBe(v.masked);
			expect(parsed.typed).toBe(v.typed);
			expect(parsed.check).toEqual(v.ok ? { ok: true } : { ok: false, reason: v.reason });
		});
	}

	for (const v of vectors['duration-format']) {
		it(`format(${v.typed} ms) → ${v.masked}`, () => expect(clock.format(v.typed)).toBe(v.masked));
	}

	it('ida e volta: format(parse(x).typed) devolve o mesmo texto', () => {
		for (const text of ['32:16', '5:37', '0:16', '1:05:07']) expect(clock.format(clock.parse(text).typed!)).toBe(text);
	});

	it('valor não representável vira texto vazio', () => {
		expect(clock.format(-5)).toBe('');
		expect(clock.format(Number.NaN)).toBe('');
	});
});

describe("preset 'time-hm' (faixas por trecho do valor)", () => {
	const time = Mask.of('time-hm');
	for (const v of vectors['time-hm']) {
		it(`${v.input} → ${v.masked} (${v.ok ? 'ok' : v.reason})`, () => {
			expect(time.check(time.apply(v.input))).toEqual(v.ok ? { ok: true } : { ok: false, reason: v.reason });
		});
	}
});

describe('números (separadores e casas são parâmetros)', () => {
	for (const v of vectors.number) {
		it(`${JSON.stringify(v.config)} ${v.input} → ${v.masked}${v.note ? ` (${v.note})` : ''}`, () => {
			const parsed = Mask.number(v.config as TMaskNumber).parse(v.input);
			expect(parsed.masked).toBe(v.masked);
			expect(parsed.typed).toBe(v.typed);
			expect(parsed.unmasked).toBe(v.input.replace(/\D/g, ''));
		});
	}

	for (const v of vectors['number-format']) {
		it(`format(${v.typed}) → ${v.masked}`, () => expect(Mask.number(v.config as TMaskNumber).format(v.typed)).toBe(v.masked));
	}

	it('digitar um dígito por vez, e apagar com backspace', () => {
		const money = Mask.number({ scale: 2, decimal: ',', group: '.' });
		let text = '';
		const typed = ['1', '2', '3', '4', '5'].map((digit) => (text = money.apply(text + digit)));
		expect(typed).toEqual(['0,01', '0,12', '1,23', '12,34', '123,45']);
		expect(money.apply(text.slice(0, -1))).toBe('12,34');
	});

	it('valor negativo ou inválido não é representável', () => {
		const money = Mask.number({ scale: 2, decimal: ',' });
		expect(money.format(-1)).toBe('');
		expect(money.format(Number.NaN)).toBe('');
	});
});

describe("preset 'card-groups' (Luhn)", () => {
	const card = Mask.of('card-groups');
	for (const v of vectors['card-groups']) {
		it(`${v.input} → ${v.ok ? 'ok' : v.reason}`, () => {
			expect(card.apply(v.input)).toBe(v.masked);
			expect(card.check(card.apply(v.input))).toEqual(v.ok ? { ok: true } : { ok: false, reason: v.reason });
		});
	}
});

describe('checks (dados)', () => {
	const run = (text: string, checks: TMaskCheck[]) => MaskCheckUtils.run(text, checks);

	it('enum e length', () => {
		expect(run('AB12', [{ type: 'enum', from: 0, to: 2, values: ['AB', 'CD'] }])).toBeUndefined();
		expect(run('ZZ12', [{ type: 'enum', from: 0, to: 2, values: ['AB', 'CD'] }])).toBe('enum');
		expect(run('123', [{ type: 'length', min: 4 }])).toBe('length');
		expect(run('12345', [{ type: 'length', max: 4 }])).toBe('length');
	});

	it('weighted: dígitos verificadores em sequência (o 2º usa o corpo + o 1º)', () => {
		const mod11 = (weights: number[]) => ({ weights, modulus: 11, rule: 'complement-zero-below-2' as const });
		const checks: TMaskCheck[] = [{ type: 'weighted', specs: [mod11([10, 9, 8, 7, 6, 5, 4, 3, 2]), mod11([11, 10, 9, 8, 7, 6, 5, 4, 3, 2])] }];
		expect(run('12345678909', checks)).toBeUndefined();
		expect(run('12345678908', checks)).toBe('check-digit');
		expect(run('12', checks)).toBe('length');
	});

	it('mod97', () => {
		expect(run('3214282912345698765432161182', [{ type: 'mod97' }])).toBeUndefined();
		expect(run('3214282912345698765432161183', [{ type: 'mod97' }])).toBe('check-digit');
	});

	it('range ignora trecho ainda vazio e recusa não numérico', () => {
		expect(run('', [{ type: 'range', from: 0, to: 2, min: 0, max: 59 }])).toBeUndefined();
		expect(run('AB', [{ type: 'range', min: 0, max: 59 }])).toBe('range');
	});
});

describe('regras por instância (sem estado global)', () => {
	it('uma regra própria vale só para aquela máscara', () => {
		const code = Mask.of({ pattern: 'NN-NN', rules: { N: { match: ['[A-Z0-9]'] } } });
		expect(code.apply('AB12')).toBe('AB-12');
		expect(code.apply('ab12')).toBe('12'); // minúsculas não casam com [A-Z0-9]
		expect(Mask.ruleKeys()).not.toContain('N');
	});

	it('não altera as regras das outras instâncias', () => {
		const a = new MaskEngine({ Q: { match: ['[abc]'] } });
		const b = new MaskEngine();
		expect(a.ruleKeys()).toContain('Q');
		expect(b.ruleKeys()).not.toContain('Q');
	});

	it('herda as regras padrão', () => {
		const m = Mask.of({ pattern: '00-00', rules: { Q: { match: ['x'] } } });
		expect(m.apply('1234')).toBe('12-34');
	});
});

describe('presets registráveis', () => {
	it('registra um preset (dado) e usa pelo id', () => {
		Mask.preset('test-code', { pattern: '000-000', checks: [{ type: 'range', from: 0, to: 3, min: 1, max: 500 }] });
		const m = Mask.of('test-code');
		expect(m.apply('123456')).toBe('123-456');
		expect(m.check('123-456')).toEqual({ ok: true });
		expect(m.check('999-456')).toEqual({ ok: false, reason: 'range' });
		expect(Mask.hasPreset('test-code')).toBe(true);
	});

	it('um padrão que não é id de preset é tratado como padrão', () => {
		expect(Mask.of('00:00').apply('1234')).toBe('12:34');
	});
});

describe('três valores (masked / unmasked / typed)', () => {
	it('texto sem codec: typed = unmasked', () => {
		const m = Mask.of('000.000');
		expect(m.parse('123456')).toMatchObject({ masked: '123.456', unmasked: '123456', typed: '123456' });
	});

	it('inteiro', () => {
		expect(Mask.of<number>('integer').parse('0042').typed).toBe(42);
	});

	it('vazio não inventa valor', () => {
		const parsed = Mask.of<number>('duration-clock').parse('');
		expect(parsed.masked).toBe('');
		expect(parsed.check).toEqual({ ok: false, reason: 'pattern' });
	});
});
