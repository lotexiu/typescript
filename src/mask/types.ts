import type { TWeightedSpec } from '@ts/checksum/types';

type TMaskRule = {
	match: string[];
	flags?: string;
};

/** Preenchimento do valor cru antes de aplicar o padrão (só se houver algo digitado). `side` padrão: `start` se `reversed`, senão `end`. */
type TMaskPad = Readonly<{ char: string; length: number; side?: 'start' | 'end' }>;

/**
 * Checagens sobre o valor **sem máscara**, descritas só com dados (portáveis).
 * `from`/`to` seguem `String.slice` (negativos contam do fim — úteis em formatos alinhados à direita).
 */
/** Trecho do valor sem máscara (`String.slice`). */
type TMaskSlice = Readonly<{ from: number; to?: number }>;

type TMaskCheck =
	Readonly<{ type: 'range'; from?: number; to?: number; min: number; max: number }>
	| Readonly<{ type: 'enum'; from?: number; to?: number; values: readonly string[] }>
	| Readonly<{ type: 'length'; min?: number; max?: number }>
	/** Últimos `specs.length` caracteres são dígitos verificadores, calculados em sequência (o 2º usa corpo + 1º). */
	| Readonly<{ type: 'weighted'; specs: readonly TWeightedSpec[] }>
	| Readonly<{ type: 'luhn' }>
	| Readonly<{ type: 'mod97' }>
	/** A data formada pelos 3 trechos existe no calendário (bissexto, dia por mês). Trecho ainda vazio = incompleto, passa. */
	| Readonly<{ type: 'date'; year: TMaskSlice; month: TMaskSlice; day: TMaskSlice }>;

type TMaskIssue = 'pattern' | 'range' | 'enum' | 'length' | 'check-digit' | 'calendar';
type TMaskCheckResult = Readonly<{ ok: true }> | Readonly<{ ok: false; reason: TMaskIssue }>;

/** Número decimal "da direita para a esquerda": os dígitos digitados entram por último; separadores são parâmetros. */
type TMaskNumber = Readonly<{ scale: number; decimal: string; group?: string; groupSize?: number }>;

type TMaskCodecId = 'text' | 'integer' | 'duration';

type TMaskCodec<T = unknown> = Readonly<{
	/** valor sem máscara → valor tipado (`undefined` se não dá para interpretar) */
	parse(unmasked: string): T | undefined;
	/** valor tipado → valor sem máscara */
	format(typed: T): string | undefined;
}>;

type TMaskOptions = Readonly<{
	/** Preenche da direita para a esquerda (números, durações). */
	reversed?: boolean;
	pad?: TMaskPad;
	checks?: readonly TMaskCheck[];
	/** Como o valor sem máscara vira valor tipado. Padrão: `text`. */
	codec?: TMaskCodecId | TMaskCodec;
	/** Formato numérico (substitui o padrão de caracteres). */
	number?: TMaskNumber;
	/** Regras de caractere **só desta máscara** (somam-se às padrão; não mexem no estado global). */
	rules?: Readonly<Record<string, TMaskRule>>;
}>;

/** Máscara registrável: um padrão (string) + opções. É só dado. */
type TMaskDefinition = TMaskOptions & Readonly<{ pattern?: string }>;

type TMaskParsed<T> = Readonly<{ masked: string; unmasked: string; typed: T | undefined; check: TMaskCheckResult }>;

export type { TMaskRule, TMaskPad, TMaskSlice, TMaskCheck, TMaskIssue, TMaskCheckResult, TMaskNumber, TMaskCodecId, TMaskCodec, TMaskOptions, TMaskDefinition, TMaskParsed };
