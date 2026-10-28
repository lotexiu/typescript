import { ASCII_DIGIT_ZERO, IBAN_MODULUS, LETTER_A_VALUE, LUHN_MODULUS } from './declarations';
import { TCharValue, TDigitRule, TWeightedSpec } from './types';

/**
 * Dígitos verificadores como dados + funções puras. Nada aqui conhece documento, país ou formato:
 * quem descreve um documento é quem consome (um pacote de dados de região, ou o próprio app), passando um `TWeightedSpec`.
 * Entradas inválidas devolvem `undefined`/`false` (erro como valor), nunca lançam.
 */
class ChecksumUtils {
	/** Valor numérico de um caractere, ou `undefined` se não vale para `kind`. */
	static charValue(char: string, kind: TCharValue = 'digit'): number | undefined {
		if (char.length !== 1) return undefined;
		const code = char.charCodeAt(0);
		if (kind === 'digit') return code >= 48 && code <= 57 ? code - ASCII_DIGIT_ZERO : undefined;
		return code >= ASCII_DIGIT_ZERO ? code - ASCII_DIGIT_ZERO : undefined;
	}

	/** Pesos `from..to` repetidos em ciclo, contados **da direita**, devolvidos da esquerda para a direita (módulo 11 clássico: `2..9`). */
	static cyclicWeights(length: number, from: number, to: number): number[] {
		const span = to - from + 1;
		return Array.from({ length }, (_, index) => from + ((length - 1 - index) % span));
	}

	static weightedSum(text: string, spec: TWeightedSpec): number | undefined {
		if (text.length !== spec.weights.length) return undefined;
		let sum = 0;
		for (let index = 0; index < text.length; index++) {
			const value = ChecksumUtils.charValue(text[index], spec.charValue);
			if (value === undefined) return undefined;
			const product = value * spec.weights[index];
			sum += spec.sumProductDigits ? ChecksumUtils.digitSum(product) : product;
		}
		return sum;
	}

	/** Dígito verificador de `text` (o corpo, **sem** o dígito), ou `undefined` se `text` não bate com `spec`. */
	static digit(text: string, spec: TWeightedSpec): number | undefined {
		const sum = ChecksumUtils.weightedSum(text, spec);
		if (sum === undefined) return undefined;
		return ChecksumUtils.applyRule(sum % spec.modulus, spec.modulus, spec.rule);
	}

	static applyRule(remainder: number, modulus: number, rule: TDigitRule): number {
		switch (rule) {
			case 'complement-zero-below-2':
				return remainder < 2 ? 0 : modulus - remainder;
			case 'remainder-zero-above-9':
				return remainder > 9 ? 0 : remainder;
			case 'complement':
				return (modulus - remainder) % modulus;
			case 'remainder':
				return remainder;
		}
	}

	/** Dígito Luhn do corpo (sem o dígito). */
	static luhnDigit(body: string): number | undefined {
		const sum = ChecksumUtils.luhnSum(body, true);
		return sum === undefined ? undefined : (LUHN_MODULUS - (sum % LUHN_MODULUS)) % LUHN_MODULUS;
	}

	/** `true` se `full` (corpo + dígito) passa no Luhn (cartões, IMEI). */
	static luhnValid(full: string): boolean {
		const sum = ChecksumUtils.luhnSum(full, false);
		return sum !== undefined && full.length > 1 && sum % LUHN_MODULUS === 0;
	}

	/**
	 * Resto mod 97 de um texto alfanumérico em que letras valem 10-35 (A=10): é a conta do IBAN
	 * (reordene país+dígitos para o fim antes; válido quando o resto é 1). Feito por partes — nunca estoura `number`.
	 */
	static mod97(text: string): number | undefined {
		let remainder = 0;
		for (const char of text.toUpperCase()) {
			const code = char.charCodeAt(0);
			const value = code >= 65 && code <= 90 ? String(code - 65 + LETTER_A_VALUE) : ChecksumUtils.charValue(char) !== undefined ? char : undefined;
			if (value === undefined) return undefined;
			for (const digit of value) remainder = (remainder * 10 + Number(digit)) % IBAN_MODULUS;
		}
		return remainder;
	}

	/** Todos os caracteres iguais (`111.111.111-11`)? Muitos documentos rejeitam isso mesmo com dígito certo. */
	static allSame(text: string): boolean {
		return text.length > 1 && [...text].every((char) => char === text[0]);
	}

	static digitSum(value: number): number {
		let sum = 0;
		for (let rest = Math.abs(value); rest > 0; rest = Math.floor(rest / 10)) sum += rest % 10;
		return sum;
	}

	/** `doubleFirst`: o caractere mais à direita é dobrado (cálculo do dígito a partir do corpo); senão o segundo (validação do número inteiro). */
	static luhnSum(text: string, doubleFirst: boolean): number | undefined {
		let sum = 0;
		for (let offset = 0; offset < text.length; offset++) {
			const value = ChecksumUtils.charValue(text[text.length - 1 - offset]);
			if (value === undefined) return undefined;
			const doubled = (offset % 2 === 0) === doubleFirst;
			sum += doubled ? ChecksumUtils.digitSum(value * 2) : value;
		}
		return sum;
	}
}

export { ChecksumUtils };
