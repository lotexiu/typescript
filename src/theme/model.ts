import { signal } from '@ts/reactive-node/signal/model'
import { TSignal } from '@ts/reactive-node/types';
import { ThemeStyle } from './style/model';
import { TThemeMode } from './types';

class Theme {
	readonly mode: TSignal<TThemeMode>;
	readonly style: TSignal<ThemeStyle>;

	constructor(initialStyle: ThemeStyle, initialMode: TThemeMode = 'dark') {
		this.mode = signal(initialMode);
		this.style = signal(initialStyle);
	}
}

export { Theme };
