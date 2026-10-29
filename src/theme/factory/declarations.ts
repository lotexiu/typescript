import { TLocaleMap } from '@ts/locale/types';

const FACTORY_LOCALES = {
	'en-US': {
		unknownSeed: 'This seed id does not exist in the factory. See `cause` for the id and the declared seed ids.',
		unknownPalette: 'This palette id is not produced by the factory. See `cause` for the id and the ids it produces.',
	},
	'pt-BR': {
		unknownSeed: 'Este id de seed não existe na factory. Veja `cause` para o id e os ids de seed declarados.',
		unknownPalette: 'Este id de paleta não é produzido pela factory. Veja `cause` para o id e os ids que ela produz.',
	},
} as const satisfies TLocaleMap;

export { FACTORY_LOCALES };
