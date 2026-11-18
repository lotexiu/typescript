import { TLocaleMap } from '@ts/locale/types';

/** Messages of the errors thrown by `Form` (`undeclaredControl`, `invalidControl`). */
const DEFINITION_LOCALES = {
	'en-US': {
		undeclaredControl: 'The form does not declare this control id. See `cause` for the id and the declared ids.',
		invalidControl: 'This value does not fit the control definition. See `cause` for the id, the value and the definition.',
	},
	'pt-BR': {
		undeclaredControl: 'O formulário não declara este id de controle. Veja `cause` para o id e os ids declarados.',
		invalidControl: 'Este valor não cabe na definição do controle. Veja `cause` para o id, o valor e a definição.',
	},
} as const satisfies TLocaleMap;

export { DEFINITION_LOCALES };
