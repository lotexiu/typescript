import { computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { Time } from '@ts/time/model';
import { toggle } from '@tsr/toggle/model';
import { TDatePicker, TDatePickerConfig, TDatePickerDay, TDatePickerView } from './types';
import { DatePickerUtils } from './utils';

const YEAR_BLOCK_SIZE = 12;

function datePicker(config: TDatePickerConfig = {}): TDatePicker {
	const { mode = 'single', initial, initialRange, minDate, maxDate } = config;

	const cursor = new Time(initial ?? initialRange?.start ?? new Date());
	const open = toggle(false);
	const view = signal<TDatePickerView>('days');
	const selectedStart = signal<Date | undefined>(mode === 'range' ? initialRange?.start : initial);
	const selectedEnd = signal<Date | undefined>(mode === 'range' ? initialRange?.end : undefined);

	function isDisabledDate(date: Date): boolean {
		if (minDate && DatePickerUtils.startOfDay(date) < DatePickerUtils.startOfDay(minDate)) return true;
		if (maxDate && DatePickerUtils.startOfDay(date) > DatePickerUtils.startOfDay(maxDate)) return true;
		return false;
	}

	// Always pin the day to 1 before touching year/month: `Time`'s fields mutate a real `Date` in
	// place, and e.g. going from Jan 31 to February via `setMonth` overflows into March (Feb has no
	// 31st) — day 1 exists in every month, so it can never trigger that rollover.
	function setCursor(year: number, month: number): void {
		Signal.batch(() => {
			cursor.day.set(1);
			cursor.year.set(year);
			cursor.month.set(month);
		});
	}

	const days = computed<TDatePickerDay[]>(() => {
		const month = cursor.month();
		const year = cursor.year();
		// `Time.calendarDays()`'s own `today` flag marks whichever cell matches `cursor.day()` —
		// that's this picker's internal cursor day (always 1 here, see `setCursor`), not the real
		// date. Only `{day, month}` (the grid layout) is reused; "today"/selected/range are ours.
		return cursor.calendarDays().map((cell) => {
			const date = new Date(year, cell.month, cell.day);
			const isRangeStart = mode === 'range' && DatePickerUtils.sameDay(date, selectedStart());
			const isRangeEnd = mode === 'range' && DatePickerUtils.sameDay(date, selectedEnd());
			return {
				date,
				isCurrentMonth: cell.month === month,
				isToday: DatePickerUtils.sameDay(date, new Date()),
				isSelected:
					mode === 'single' ? DatePickerUtils.sameDay(date, selectedStart()) : isRangeStart || isRangeEnd,
				isDisabled: isDisabledDate(date),
				isRangeStart,
				isRangeEnd,
				isInRange: mode === 'range' && DatePickerUtils.isWithinRange(date, selectedStart(), selectedEnd()),
			};
		});
	});

	const yearBlockStart = computed(() => Math.floor(cursor.year() / YEAR_BLOCK_SIZE) * YEAR_BLOCK_SIZE);
	const monthItems = computed(() => Array.from({ length: 12 }, (_, i) => i));
	const yearItems = computed(() => Array.from({ length: YEAR_BLOCK_SIZE }, (_, i) => yearBlockStart() + i));

	function prevMonth(): void {
		setCursor(cursor.year(), cursor.month() - 1);
	}
	function nextMonth(): void {
		setCursor(cursor.year(), cursor.month() + 1);
	}
	function prevYear(): void {
		setCursor(cursor.year() - 1, cursor.month());
	}
	function nextYear(): void {
		setCursor(cursor.year() + 1, cursor.month());
	}
	function prevYearBlock(): void {
		setCursor(cursor.year() - YEAR_BLOCK_SIZE, cursor.month());
	}
	function nextYearBlock(): void {
		setCursor(cursor.year() + YEAR_BLOCK_SIZE, cursor.month());
	}

	function openMonthView(): void {
		view.set('months');
	}
	function openYearView(): void {
		view.set('years');
	}

	function selectMonth(index: number): void {
		setCursor(cursor.year(), index);
		view.set('days');
	}

	function selectYear(year: number): void {
		setCursor(year, cursor.month());
		view.set('months');
	}

	function selectDate(date: Date): void {
		if (isDisabledDate(date)) return;

		if (mode === 'single') {
			selectedStart.set(date);
			open.off();
			return;
		}

		const hasOpenRange = selectedStart() !== undefined && selectedEnd() === undefined;
		if (!hasOpenRange) {
			selectedStart.set(date);
			selectedEnd.set(undefined);
			return;
		}

		const start = selectedStart()!;
		if (date.getTime() < start.getTime()) {
			selectedStart.set(date);
			selectedEnd.set(start);
		} else {
			selectedEnd.set(date);
		}
		open.off();
	}

	function selectToday(): void {
		selectDate(new Date());
	}

	function clear(): void {
		selectedStart.set(undefined);
		selectedEnd.set(undefined);
	}

	function resetToSelection(): void {
		const anchor = selectedStart() ?? new Date();
		setCursor(anchor.getFullYear(), anchor.getMonth());
		view.set('days');
	}
	open.subscribe((isOpen) => {
		if (isOpen) resetToSelection();
	});

	return {
		open,
		view,
		year: cursor.year,
		month: cursor.month,
		days,
		monthItems,
		yearItems,
		selectedStart,
		selectedEnd,
		prevMonth,
		nextMonth,
		prevYear,
		nextYear,
		prevYearBlock,
		nextYearBlock,
		openMonthView,
		openYearView,
		selectMonth,
		selectYear,
		selectDate,
		selectToday,
		clear,
	};
}

export { datePicker };
