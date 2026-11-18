import { TReactive } from '@tsr-node/types';
import { TAdjustmentDefinitions, TAdjustmentValues } from '../adjustment/types';
import { TColor } from '../color/types';
import { Palette } from '../palette/model';
import { TThemeMode } from '../types';

/** A color with an id, read reactively. */
type SlotColor = {
	/** Id of the slot. */
	readonly id: string;
	/** The color. */
	readonly value: TReactive<TColor>;
};

/** What a style's `tokens` function receives. */
type TStyleContext<PaletteId extends string = string, RoleName extends string = string, Adjustments extends TAdjustmentDefinitions = TAdjustmentDefinitions> = {
	/** Current mode. */
	readonly mode: TThemeMode;
	/** Current contrast setting. */
	readonly contrast: number;
	/** Palette in use for each id. */
	readonly palettes: Readonly<Record<PaletteId, Palette>>;
	/** Color of each role. */
	readonly roles: Readonly<Record<RoleName, TColor>>;
	/** Value of each adjustment. */
	readonly adjustments: TAdjustmentValues<Adjustments>;
};

/** A style's token function. */
type TStyleTokens<PaletteId extends string = string, RoleName extends string = string, Adjustments extends TAdjustmentDefinitions = TAdjustmentDefinitions, Tokens = Record<string, unknown>> = {
	resolve(context: TStyleContext<PaletteId, RoleName, Adjustments>): Tokens;
}['resolve'];

export type { SlotColor, TStyleContext, TStyleTokens };
