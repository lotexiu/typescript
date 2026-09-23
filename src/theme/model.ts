import { Model, model } from '../model/model';
import { ThemeStyle } from './style/model';
import { TThemeMode } from './types';

class Theme {
	readonly mode: Model<TThemeMode>;
	readonly style: Model<ThemeStyle>;

	constructor(initialStyle: ThemeStyle, initialMode: TThemeMode = 'dark') {
		this.mode = model(initialMode);
		this.style = model(initialStyle);
	}
}

export { Theme };
