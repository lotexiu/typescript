import { Signal, signal } from '@tsr-node/signal/model';
import { ThemeStyle } from './style/model';
import { TThemeMode } from './types';

class Theme {
	readonly mode: Signal<TThemeMode>;
	readonly style: Signal<ThemeStyle>;

	constructor(initialStyle: ThemeStyle, initialMode: TThemeMode = 'dark') {
		this.mode = signal(initialMode);
		this.style = signal(initialStyle);
	}
}

export { Theme };
