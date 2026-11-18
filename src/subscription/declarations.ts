import { TLocaleMap } from '@ts/locale/types';

/** Messages of the errors thrown by `Subscription`. */
const SUBSCRIPTION_LOCALES = {
	'en-US': {
		manyListenersFailed: 'Multiple listeners threw.',
	},
	'pt-BR': {
		manyListenersFailed: 'Vários listeners lançaram erro.',
	},
} as const satisfies TLocaleMap;

export { SUBSCRIPTION_LOCALES };
