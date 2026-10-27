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


/*
* Created with https://www.css-gradient.com
* Gradient link: https://www.css-gradient.com/?blobs=010101@14,16;ffffff@96,95&base=010101&gt=m&from=css
*/
background: #010101;
background: radial-gradient(at 14% 16%, #010101, transparent 70%), radial-gradient(at 96% 95%, #FFFFFF, transparent 70%), #010101;