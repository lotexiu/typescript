/**
 * @internal
 * Checagens de validade puras e diretas — sem estado, sem "regra" em forma
 * de closure. Cada plugin que precisar validar algo chama a checagem que
 * fizer sentido pra ele diretamente e decide como reportar/reagir; não há
 * mais um mecanismo genérico de lista de regras por trás disso.
*/
class _Validation {
	/** Verdadeiro pra qualquer valor "presente" — não vazio, não nulo, não undefined. */
	static required(value: unknown): boolean {
		return value !== undefined && value !== null && value !== '';
	}

	/** Whether `value` matches `regex`. */
	static pattern(value: string, regex: RegExp): boolean {
		return regex.test(value);
	}

	/** Valida dígitos verificadores de CPF. Aceita com ou sem máscara. */
	static isValidCPF(cpf: string): boolean {
		const digits = cpf.replace(/\D/g, '');
		if (digits.length !== 11) return false;
		if (/^(\d)\1{10}$/.test(digits)) return false;

		const checkDigit = (base: string): number => {
			let sum = 0;
			const weightStart = base.length + 1;
			for (let i = 0; i < base.length; i++) {
				sum += Number(base[i]) * (weightStart - i);
			}
			const remainder = (sum * 10) % 11;
			return remainder >= 10 ? 0 : remainder;
		};

		if (checkDigit(digits.slice(0, 9)) !== Number(digits[9])) return false;
		if (checkDigit(digits.slice(0, 10)) !== Number(digits[10])) return false;
		return true;
	}

	/** Valida dígitos verificadores de CNPJ. Aceita com ou sem máscara. */
	static isValidCNPJ(cnpj: string): boolean {
		const digits = cnpj.replace(/\D/g, '');
		if (digits.length !== 14) return false;
		if (/^(\d)\1{13}$/.test(digits)) return false;

		const checkDigit = (base: string, weights: number[]): number => {
			let sum = 0;
			for (let i = 0; i < base.length; i++) {
				sum += Number(base[i]) * weights[i];
			}
			const remainder = sum % 11;
			return remainder < 2 ? 0 : 11 - remainder;
		};

		const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
		if (checkDigit(digits.slice(0, 12), firstWeights) !== Number(digits[12])) return false;

		const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
		if (checkDigit(digits.slice(0, 13), secondWeights) !== Number(digits[13])) return false;

		return true;
	}
}

/** Verdadeiro pra qualquer valor "presente" — não vazio, não nulo, não undefined. */
const required = _Validation.required;
/** Whether `value` matches `regex`. */
const pattern = _Validation.pattern;
/** Valida dígitos verificadores de CPF. Aceita com ou sem máscara. */
const isValidCPF = _Validation.isValidCPF;
/** Valida dígitos verificadores de CNPJ. Aceita com ou sem máscara. */
const isValidCNPJ = _Validation.isValidCNPJ;

export {
	_Validation,
	required,
	pattern,
	isValidCPF,
	isValidCNPJ,
}
