import { TLocaleMap } from '@ts/locale/types';

const THEME_LOCALES = {
	'en-US': {
		undeclaredPalette: 'The current style does not declare this palette id. See `cause` for the id and the ids the style declares.',
	},
	'pt-BR': {
		undeclaredPalette: 'O estilo atual não declara este id de paleta. Veja `cause` para o id e os ids que o estilo declara.',
	},
} as const satisfies TLocaleMap;

export { THEME_LOCALES };
