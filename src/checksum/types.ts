/**
 * Como o resto da divisão vira dígito verificador.
 * - `complement-zero-below-2`: `resto < 2 ? 0 : módulo - resto` (variante comum do módulo 11)
 * - `remainder-zero-above-9`: `resto > 9 ? 0 : resto` (variante do módulo 11)
 * - `complement`: `(módulo - resto) % módulo` (Luhn, mod 10)
 * - `remainder`: o próprio resto
 */
type TDigitRule = 'complement-zero-below-2' | 'remainder-zero-above-9' | 'complement' | 'remainder';

/** Valor numérico de cada caractere: `digit` só aceita 0-9; `ascii-48` = código ASCII − 48 (dígitos 0-9; letras maiúsculas A=17, B=18, ...). */
type TCharValue = 'digit' | 'ascii-48';

/** Cálculo de dígito verificador por soma ponderada, descrito só com dados (portável para qualquer linguagem). */
type TWeightedSpec = Readonly<{
	/** Um peso por caractere do texto, da esquerda para a direita. */
	weights: readonly number[];
	modulus: number;
	rule: TDigitRule;
	charValue?: TCharValue;
	/** Soma os algarismos de cada produto (`18 → 1+8`), como no IE-MG e no Luhn. */
	sumProductDigits?: boolean;
}>;

export type { TDigitRule, TCharValue, TWeightedSpec };
