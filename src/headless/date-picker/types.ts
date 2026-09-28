import { Computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { Toggle } from '@tsr/toggle/model';

type TDatePickerMode = 'single' | 'range';
type TDatePickerView = 'days' | 'months' | 'years';

type TDatePickerConfig = {
	mode?: TDatePickerMode;
	/** Used when `mode` is `'single'`. */
	initial?: Date;
	/** Used when `mode` is `'range'`. */
	initialRange?: { start?: Date; end?: Date };
	minDate?: Date;
	maxDate?: Date;
};

type TDatePickerDay = {
	date: Date;
	isCurrentMonth: boolean;
	isToday: boolean;
	/** Single mode: this is `selectedStart`. Range mode: this is `selectedStart` or `selectedEnd`. */
	isSelected: boolean;
	isDisabled: boolean;
	isRangeStart: boolean;
	isRangeEnd: boolean;
	/** Strictly between `selectedStart` and `selectedEnd` — excludes the endpoints themselves. */
	isInRange: boolean;
};

type TDatePicker = {
	open: Toggle;
	view: Signal<TDatePickerView>;
	year: Computed<number>;
	month: Computed<number>;
	days: Computed<TDatePickerDay[]>;
	/** 0-11, for a month-grid view. No labels — locale/formatting is the caller's job. */
	monthItems: Computed<number[]>;
	/** The 12 years of the currently displayed year block, for a year-grid view. */
	yearItems: Computed<number[]>;
	selectedStart: Signal<Date | undefined>;
	selectedEnd: Signal<Date | undefined>;
	prevMonth(): void;
	nextMonth(): void;
	prevYear(): void;
	nextYear(): void;
	prevYearBlock(): void;
	nextYearBlock(): void;
	openMonthView(): void;
	openYearView(): void;
	/** Sets the displayed month and switches `view` back to `'days'`. */
	selectMonth(index: number): void;
	/** Sets the displayed year and switches `view` to `'months'` (drill-down: years -> months -> days). */
	selectYear(year: number): void;
	/** No-ops if `date` is outside `minDate`/`maxDate`. Closes `open` once a selection is complete. */
	selectDate(date: Date): void;
	selectToday(): void;
	clear(): void;
};

export type { TDatePickerMode, TDatePickerView, TDatePickerConfig, TDatePickerDay, TDatePicker };
