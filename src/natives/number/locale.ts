import { TLocaleMap } from "@ts/locale/types";

const NUMBER_LOCALES = {
	"en-US": {
		finite: 'Value must be finite',
		range: 'Value must be in range',
		invalid: 'Invalid value',
		notNan: 'Value cant be NaN',
	},
	"pt-BR": {
		finite: 'O valor deve ser finito',
		range: 'O valor deve estar no intervalo',
		invalid: 'Valor inválido',
		notNan: 'O valor não pode ser NaN',
	}
} as const satisfies TLocaleMap

export {
	NUMBER_LOCALES
}