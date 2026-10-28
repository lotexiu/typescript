import { ChecksumUtils } from '@ts/checksum/utils';
import type { TWeightedSpec } from '@ts/checksum/types';
import { PlainDate } from '@ts/plain/date/model';
import { TMaskCheck, TMaskIssue } from '../types';
import { MOD97_VALID_REMAINDER } from './declarations';

/** Executa as checagens (dados) sobre o valor sem máscara. Devolve o primeiro motivo de falha, ou `undefined`. */
class MaskCheckUtils {
	static run(unmasked: string, checks: readonly TMaskCheck[] = []): TMaskIssue | undefined {
		for (const check of checks) {
			const issue = MaskCheckUtils.one(unmasked, check);
			if (issue) return issue;
		}
		return undefined;
	}

	static one(unmasked: string, check: TMaskCheck): TMaskIssue | undefined {
		switch (check.type) {
			case 'range':
				return MaskCheckUtils.range(unmasked.slice(check.from, check.to), check.min, check.max);
			case 'enum': {
				const part = unmasked.slice(check.from, check.to);
				return part === '' || check.values.includes(part) ? undefined : 'enum';
			}
			case 'length':
				return unmasked.length < (check.min ?? 0) || unmasked.length > (check.max ?? Infinity) ? 'length' : undefined;
			case 'weighted':
				return MaskCheckUtils.weighted(unmasked, check.specs);
			case 'date':
				return MaskCheckUtils.date(unmasked, check);
			case 'luhn':
				return ChecksumUtils.luhnValid(unmasked) ? undefined : 'check-digit';
			case 'mod97':
				return ChecksumUtils.mod97(unmasked) === MOD97_VALID_REMAINDER ? undefined : 'check-digit';
		}
	}

	/** Qualquer trecho vazio = ainda incompleto (passa); completo, a data tem de existir. */
	static date(unmasked: string, { year, month, day }: Extract<TMaskCheck, { type: 'date' }>): TMaskIssue | undefined {
		const [y, m, d] = [year, month, day].map(({ from, to }) => unmasked.slice(from, to));
		if (y === '' || m === '' || d === '') return undefined;
		return PlainDate.isValid(Number(y), Number(m), Number(d)) ? undefined : 'calendar';
	}

	/** Parte vazia passa (ainda não foi digitada); fora da faixa ou não numérica, não. */
	static range(part: string, min: number, max: number): TMaskIssue | undefined {
		if (part === '') return undefined;
		const value = Number(part);
		return Number.isFinite(value) && value >= min && value <= max ? undefined : 'range';
	}

	static weighted(unmasked: string, specs: readonly TWeightedSpec[]): TMaskIssue | undefined {
		const count = specs.length;
		if (unmasked.length <= count) return 'length';
		const body = unmasked.slice(0, -count);
		const given = unmasked.slice(-count);
		let expected = '';
		for (const spec of specs) {
			const digit = ChecksumUtils.digit(body + expected, spec);
			if (digit === undefined) return 'check-digit';
			expected += digit;
		}
		return expected === given ? undefined : 'check-digit';
	}
}

export { MaskCheckUtils };
