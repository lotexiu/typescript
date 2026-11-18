import { describe, expect, it } from 'vitest';
import { Mask } from '@ts/mask/model';

describe('Mask.date — ordem e separador são parâmetros', () => {
	const dmy = Mask.date({ order: 'dmy', separator: '/' });
	const mdy = Mask.date({ order: 'mdy', separator: '-' });
	const ymd = Mask.date({ order: 'ymd' });

	it('formata digitando só números (a cada dígito)', () => {
		let text = '';
		const steps = [...'28102026'].map((digit) => (text = dmy.apply(text + digit)));
		expect(steps).toEqual(['2', '28', '28/1', '28/10', '28/10/2', '28/10/20', '28/10/202', '28/10/2026']);
	});

	it('mesma data, três ordens', () => {
		expect(dmy.apply('28102026')).toBe('28/10/2026');
		expect(mdy.apply('10282026')).toBe('10-28-2026');
		expect(ymd.apply('20261028')).toBe('2026-10-28');
	});

	it('valor tipado é um PlainDate (e a volta)', () => {
		expect(dmy.parse('28/10/2026').typed?.toString()).toBe('2026-10-28');
		expect(mdy.parse('10-28-2026').typed?.toString()).toBe('2026-10-28');
		expect(ymd.parse('2026-10-28').typed?.dayOfWeek).toBe(3);
		expect(dmy.format(ymd.parse('2026-10-28').typed!)).toBe('28/10/2026');
		expect(ymd.format(dmy.parse('01/02/0003').typed!)).toBe('0003-02-01');
	});

	it('valida o calendário: bissexto, dia por mês, mês 13', () => {
		const ok = (text: string) => dmy.check(text);
		expect(ok('29/02/2024')).toEqual({ ok: true });
		expect(ok('29/02/2025')).toEqual({ ok: false, reason: 'calendar' });
		expect(ok('29/02/1900')).toEqual({ ok: false, reason: 'calendar' });
		expect(ok('29/02/2000')).toEqual({ ok: true });
		expect(ok('31/04/2026')).toEqual({ ok: false, reason: 'calendar' });
		expect(ok('31/12/2026')).toEqual({ ok: true });
		expect(ok('15/13/2026')).toEqual({ ok: false, reason: 'calendar' });
		expect(ok('00/10/2026')).toEqual({ ok: false, reason: 'calendar' });
		expect(ok('10/10/0000')).toEqual({ ok: false, reason: 'calendar' });
	});

	it('incompleto não é válido (forma), mas também não reclama de calendário', () => {
		expect(dmy.check('31/0')).toEqual({ ok: false, reason: 'pattern' });
		expect(dmy.parse('31/04').typed).toBeUndefined();
	});

	it('data inexistente não vira valor tipado', () => {
		expect(dmy.parse('31/04/2026').typed).toBeUndefined();
		expect(dmy.parse('31/04/2026').check).toEqual({ ok: false, reason: 'calendar' });
	});

	it('lixo no meio é ignorado como em qualquer máscara', () => {
		expect(dmy.apply('28a10b2026')).toBe('28/10/2026');
	});
});
