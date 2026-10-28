import { TMaskCodec, TMaskCodecId } from './types';

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const MS_PER_SECOND = 1000;
const PAIR = 2;
const pair = (value: number) => String(value).padStart(PAIR, '0');

/** Dígitos digitados "da direita": `…hhmmss` (os 2 últimos são segundos, os 2 anteriores minutos, o resto horas). Tipado = milissegundos. */
const duration: TMaskCodec<number> = {
	parse(unmasked) {
		if (!/^\d+$/.test(unmasked)) return undefined;
		const seconds = Number(unmasked.slice(-PAIR));
		const minutes = Number(unmasked.slice(-PAIR * 2, -PAIR) || 0);
		const hours = Number(unmasked.slice(0, -PAIR * 2) || 0);
		return ((hours * MINUTES_PER_HOUR + minutes) * SECONDS_PER_MINUTE + seconds) * MS_PER_SECOND;
	},
	format(ms) {
		if (!Number.isFinite(ms) || ms < 0) return undefined;
		const total = Math.floor(ms / MS_PER_SECOND);
		const seconds = total % SECONDS_PER_MINUTE;
		const minutes = Math.floor(total / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;
		const hours = Math.floor(total / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR));
		return hours > 0 ? `${hours}${pair(minutes)}${pair(seconds)}` : String(minutes * 100 + seconds);
	},
};

const integer: TMaskCodec<number> = {
	parse: (unmasked) => (/^\d+$/.test(unmasked) ? Number(unmasked) : undefined),
	format: (value) => (Number.isInteger(value) && value >= 0 ? String(value) : undefined),
};

const text: TMaskCodec<string> = { parse: (unmasked) => unmasked, format: (value) => value };

const MASK_CODECS: Readonly<Record<TMaskCodecId, TMaskCodec>> = { text, integer, duration } as Record<TMaskCodecId, TMaskCodec>;

export { MASK_CODECS };
