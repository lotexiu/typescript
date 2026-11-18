import { TControlAssignment, TControlDefinitions, TControlValues } from '@ts/headless/definition/types';

/**
 * The adjustments a style offers (`roundness`, `blur`...): control definitions that a `Form` can turn into a settings screen.
 */
type TAdjustmentDefinitions = TControlDefinitions;

/** One value per adjustment. */
type TAdjustmentValues<Definitions extends TAdjustmentDefinitions> = TControlValues<Definitions>;

/** Some adjustment values. */
type TAdjustmentAssignment<Definitions extends TAdjustmentDefinitions> = TControlAssignment<Definitions>;

export type { TAdjustmentDefinitions, TAdjustmentValues, TAdjustmentAssignment };
