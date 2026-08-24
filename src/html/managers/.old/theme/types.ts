/** The two themes `themeManager` recognizes. */
type TTheme = 'light' | 'dark';

/** Listener signature `themeManager.add(...)` accepts. */
type TThemeOnEvent = (theme: TTheme) => void;

export type {
	TTheme,
	TThemeOnEvent,
}
