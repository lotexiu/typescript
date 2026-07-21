import { TLocaleMap } from "@ts/locale/types";

const MATH_ERROR_LOCALE = {
	"en-US": {
		default: 'Unkown math error',
		infinity: 'Value must be finite',
		range: 'Value must be in range',
		invalid: 'Invalid value',
		nan: 'Value must be a number',
	},
	"pt-BR": {
		default: 'Erro matemático desconhecido',
		infinity: 'O valor deve ser finito',
		range: 'O valor deve estar no intervalo',
		invalid: 'Valor inválido',
		nan: 'O valor deve ser um número',
	}
} as const satisfies TLocaleMap

export {
	MATH_ERROR_LOCALE
}