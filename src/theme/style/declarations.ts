import { TLocaleMap } from '@ts/locale/types';

const STYLE_LOCALES = {
	'en-US': {
		undeclaredPalette: 'A role uses a palette id the style does not declare in `palettes`. See `cause` for the role, the id and the declared ids.',
	},
	'pt-BR': {
		undeclaredPalette: 'Um papel usa um id de paleta que o estilo não declara em `palettes`. Veja `cause` para o papel, o id e os ids declarados.',
	},
} as const satisfies TLocaleMap;

export { STYLE_LOCALES };
