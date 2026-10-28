import { REGEX_PATTERNS } from '@tsn/regex/declarations';
import type { TMaskDefinition, TMaskRule } from './types';

const { DIGITS, LETTERS, SYMBOLS } = REGEX_PATTERNS;

/** Regras de caractere padrão. Cada engine começa com estas (e pode somar as suas). */
function defaultRules(): Map<string, TMaskRule> {
	return new Map<string, TMaskRule>([
		['0', { match: [DIGITS.BASIC] }],
		['A', { match: [DIGITS.BASIC, LETTERS.EXTENDED.ALL], flags: 'v' }],
		['W', { match: [LETTERS.EXTENDED.ALL], flags: 'v' }],
		['U', { match: [LETTERS.EXTENDED.UPPERCASE], flags: 'v' }],
		['L', { match: [LETTERS.EXTENDED.LOWERCASE], flags: 'v' }],
		['S', { match: [SYMBOLS.ALL], flags: 'v' }],
		['C', { match: [SYMBOLS.CURRENCY], flags: 'v' }],
		['E', { match: [SYMBOLS.EMOJI], flags: 'v' }],
		['X', { match: ['.'], flags: 'v' }],
	]);
}

const MINUTES_OR_SECONDS_MAX = 59;
const CLOCK_MIN_DIGITS = 3;
const HOURS_MAX = 23;

/** Presets **neutros** (sem nada de país/região). Presets de região vêm de pacotes de região, via `Mask.preset`. */
const MASK_PRESETS: Readonly<Record<string, TMaskDefinition>> = {
	/** `h:mm:ss` / `m:ss` digitando só números; tipado = milissegundos. */
	'duration-clock': {
		pattern: '0{1,}:00:00',
		reversed: true,
		pad: { char: '0', length: CLOCK_MIN_DIGITS },
		codec: 'duration',
		checks: [
			{ type: 'range', from: -4, to: -2, min: 0, max: MINUTES_OR_SECONDS_MAX },
			{ type: 'range', from: -2, min: 0, max: MINUTES_OR_SECONDS_MAX },
		],
	},
	/** Hora do dia `HH:mm`. */
	'time-hm': {
		pattern: '00:00',
		checks: [
			{ type: 'range', from: 0, to: 2, min: 0, max: HOURS_MAX },
			{ type: 'range', from: 2, to: 4, min: 0, max: MINUTES_OR_SECONDS_MAX },
		],
	},
	/** Inteiro sem limite de tamanho. */
	integer: { pattern: '0{1,}', codec: 'integer' },
	/** Cartão genérico: 16 dígitos em 4 grupos + Luhn. */
	'card-groups': { pattern: '0000 0000 0000 0000', checks: [{ type: 'luhn' }] },
};

export { defaultRules, MASK_PRESETS };
