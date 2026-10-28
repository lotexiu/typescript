import { TColor, TColorFormat } from './types';

/**
 * Thin layer over `colorjs.io` — keeps the dependency behind one door and covers what palettes
 * need every time: turning a `TColor` into a string that is safe to use (always in sRGB gamut by default).
 */
class ColorUtils {
	/** `#rrggbb`, or `#rrggbbaa` when `alpha < 1`. Out-of-gamut colors are gamut-mapped, not clipped. */
	static toHex(color: TColor, alpha = 1): string {
		return ColorUtils.withAlpha(color, alpha).toString({ format: 'hex' });
	}

	/** Same color as a CSS-style string in the given format (default `rgb`). */
	static toString(color: TColor, format: TColorFormat = 'rgb'): string {
		if (format === 'hex') return ColorUtils.toHex(color);
		const spaces = { rgb: 'srgb', hsl: 'hsl', oklch: 'oklch', p3: 'p3' } as const;
		return color.to(spaces[format]).toString();
	}

	/** Copy of `color` with the given alpha (`0..1`). */
	static withAlpha(color: TColor, alpha: number): TColor {
		const copy = color.clone();
		copy.alpha = alpha;
		return copy;
	}

	/** WCAG 2.1 contrast ratio (`1..21`). */
	static contrast(a: TColor, b: TColor): number {
		return a.contrast(b, 'WCAG21');
	}

	/** Interpolation between two colors (`amount` `0..1`) in a perceptual space. */
	static mix(a: TColor, b: TColor, amount = 0.5, space = 'oklch'): TColor {
		return a.mix(b, amount, { space });
	}
}

export { ColorUtils };
