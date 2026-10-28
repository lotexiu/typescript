import { TRoleScheme } from './types';

/** Slot with this name uses `NEUTRAL_SCHEME`; every other slot uses `ACCENT_SCHEME`. */
const NEUTRAL_SLOT = 'neutral';

/** Roles of a colored slot (`primary`, `secondary`, ...). Emits `main`, `onMain`, `container`, `onContainer`, `bright`. */
const ACCENT_SCHEME = {
	main: { dark: 80, light: 40, readable: true },
	container: { dark: 30, light: 90, readable: true },
	bright: { dark: 70, light: 70 },
} as const satisfies TRoleScheme;

/** Roles of the neutral slot: backgrounds, stacked surfaces, text and lines. */
const NEUTRAL_SCHEME = {
	background: { dark: 10, light: 98 },
	surface1: { dark: 15, light: 97 },
	surface2: { dark: 20, light: 94 },
	surface3: { dark: 26, light: 91 },
	onSurface: { dark: 94, light: 10 },
	muted: { dark: 74, light: 38 },
	outline: { dark: 52, light: 60 },
	outlineSoft: { dark: 32, light: 86 },
} as const satisfies TRoleScheme;

export { NEUTRAL_SLOT, ACCENT_SCHEME, NEUTRAL_SCHEME };
