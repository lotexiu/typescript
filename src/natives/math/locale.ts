import { TLocaleMap } from "@ts/locale/types";

/** Messages of the errors thrown by `MathUtils`. */
const MATH_LOCALES = {
	"en-US": {
		unknown: 'Unkown math error',
		finite: 'Value must be finite',
		range: 'Value must be in range',
		invalid: 'Invalid value',
		notNan: 'Value cant be NaN',
	},
	"pt-BR": {
		unknown: 'Erro matemático desconhecido',
		finite: 'O valor deve ser finito',
		range: 'O valor deve estar no intervalo',
		invalid: 'Valor inválido',
		notNan: 'O valor não pode ser NaN',
	}
} as const satisfies TLocaleMap

export {
	MATH_LOCALES
}