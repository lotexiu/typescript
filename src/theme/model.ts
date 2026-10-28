import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { TValueUnsubscribe } from '@ts/subscription/types';
import { ThemeStyle } from './style/model';
import { TRoleScheme, TRoles } from './style/types';
import { TThemeMode } from './types';

class Theme {
	readonly mode: Signal<TThemeMode>;
	readonly style: Signal<ThemeStyle>;
	/** The current style resolved for the current mode — recomputed whenever either one changes. */
	readonly roles: Computed<Record<string, TRoles>>;

	/** `schemes` is forwarded to `ThemeStyle.resolve` (extra/overridden roles per slot). */
	constructor(initialStyle: ThemeStyle, initialMode: TThemeMode = 'dark', schemes: Record<string, TRoleScheme> = {}) {
		this.mode = signal(initialMode);
		this.style = signal(initialStyle);
		this.roles = computed(() => this.style().resolve(this.mode(), schemes));
	}

	/** Keeps `style` equal to `source` (applied now and on every change). Returns the function that stops following it. */
	bindStyle(source: TReactive<ThemeStyle>): TValueUnsubscribe {
		this.style.set(Signal.untracked(source));
		return source.subscribe((next) => this.style.set(next));
	}
}

export { Theme };
