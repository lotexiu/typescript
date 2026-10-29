import { TLocaleMap } from '@ts/locale/types';

const ROLE_LOCALES = {
	'en-US': {
		unknownPalette: 'A role points to a palette that was not given. See `cause` for the role and palette.',
		unresolvedBackground: 'A role sits `on` a role that does not exist or is declared after it. See `cause` for both.',
	},
	'pt-BR': {
		unknownPalette: 'Um papel aponta para uma paleta que não foi informada. Veja `cause` para o papel e a paleta.',
		unresolvedBackground: 'Um papel está `on` outro papel que não existe ou foi declarado depois dele. Veja `cause` para os dois.',
	},
} as const satisfies TLocaleMap;

export { ROLE_LOCALES };
