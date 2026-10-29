import type Color from 'colorjs.io';

/** The color object `Palette.get` returns — re-exported so consumers don't need `colorjs.io` just to type it. */
type TColor = Color;

type TColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch' | 'p3';

/**
 * How "readable one color is over another" becomes a number — bigger is more readable. `WCAG21` is `1..21`,
 * `APCA` is `Lc` (`0..~108`); thresholds are only comparable within the same metric. A function plugs in any other.
 */
type TContrastMetric = 'WCAG21' | 'APCA' | ((foreground: TColor, background: TColor) => number);

export type { TColor, TColorFormat, TContrastMetric };
