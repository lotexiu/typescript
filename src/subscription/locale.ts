import { TLocaleMap } from '@ts/locale/types';

const STOP_WATCH_LOCALES = {
	'en-US': {
		notStarted: 'StopWatch has not been started',
	},
	'pt-BR': {
		notStarted: 'O StopWatch não foi iniciado',
	},
} as const satisfies TLocaleMap;

export { STOP_WATCH_LOCALES };
