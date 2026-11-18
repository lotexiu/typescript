import { TLocaleMap } from '@ts/locale/types';

/** Messages of the adjustment errors (`undeclaredAdjustment`, `invalidAdjustment`). */
const ADJUSTMENT_LOCALES = {
	'en-US': {
		undeclaredAdjustment: 'The current style does not declare this adjustment id. See `cause` for the id and the ids the style declares.',
		invalidAdjustment: 'This value does not fit the adjustment definition. See `cause` for the id, the value and the definition.',
	},
	'pt-BR': {
		undeclaredAdjustment: 'O estilo atual não declara este id de ajuste. Veja `cause` para o id e os ids que o estilo declara.',
		invalidAdjustment: 'Este valor não cabe na definição do ajuste. Veja `cause` para o id, o valor e a definição.',
	},
} as const satisfies TLocaleMap;

export { ADJUSTMENT_LOCALES };
