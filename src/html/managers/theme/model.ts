import { CaptureManager } from "@ts/capture-manager/model";
import { TTheme, TThemeOnEvent } from "./types";

const STORAGE_KEY = 'theme';

function getSystemTheme(): TTheme {
	return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): TTheme | undefined {
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === 'light' || stored === 'dark' ? stored : undefined;
}

/**
 * ThemeManager
 * Fonte única de verdade pro tema atual (light/dark): parte da escolha
 * manual salva ou, na ausência dela, da preferência do sistema. Só escuta
 * mudança de preferência do SO enquanto houver assinante — mesmo ciclo de
 * vida de keyboardManager/mouseManager, via CaptureManager. Não gera
 * paleta/tokens de cor (isso é uma camada futura, ainda não construída);
 * este primeiro passo só resolve claro/escuro + persistência.
 */
class ThemeManager extends CaptureManager<TThemeOnEvent> {
	private currentTheme?: TTheme;
	private media?: MediaQueryList;

	private binds = {
		onSystemChange: this.onSystemChange.bind(this),
	};

	get theme(): TTheme {
		if (!this.currentTheme) this.currentTheme = getStoredTheme() ?? getSystemTheme();
		return this.currentTheme;
	}

	protected start(): void {
		this.media = matchMedia('(prefers-color-scheme: dark)');
		this.media.addEventListener('change', this.binds.onSystemChange);
	}

	protected stop(): void {
		this.media?.removeEventListener('change', this.binds.onSystemChange);
	}

	lastId: number = 0;
	protected register(value: TThemeOnEvent) {
		const id = this.lastId++;
		this.callbackMap.set(id, value);
		return id;
	}

	protected unRegister(id: number): void {
		this.callbackMap.delete(id);
	}

	private onSystemChange(event: MediaQueryListEvent): void {
		if (getStoredTheme()) return; // usuário já escolheu manualmente, ignora o SO
		this.applyTheme(event.matches ? 'dark' : 'light');
	}

	private applyTheme(theme: TTheme): void {
		if (theme === this.currentTheme) return;
		this.currentTheme = theme;
		for (const fn of this.callbacks()) fn(theme);
	}

	/** Escolha explícita do usuário: persiste e notifica. */
	setTheme(theme: TTheme): void {
		localStorage.setItem(STORAGE_KEY, theme);
		this.applyTheme(theme);
	}

	toggle(): void {
		this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
	}
}

/** Singleton `CaptureManager` for the current light/dark theme — a manual choice persisted in `localStorage`, falling back to the OS preference; tracks OS changes live only while someone subscribes via `add()`. */
const themeManager = new ThemeManager();

export {
	themeManager
}
