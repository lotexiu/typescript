import type Color from 'colorjs.io';

/** The color object `Palette.get` returns — re-exported so consumers don't need `colorjs.io` just to type it. */
type TColor = Color;

type TColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'p3';

export type { TColor, TColorFormat };
