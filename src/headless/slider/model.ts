import { Computed, computed } from '@tsr-node/computed/model';
import { Signal, signal } from '@tsr-node/signal/model';
import { Control } from '../control/model';
import { KEYS } from '../declarations';
import { TAttributes, TKeyIntent, TOrientation, TTextDirection } from '../types';
import { HeadlessUtils } from '../utils';
import { SLIDER_DEFAULTS } from './declarations';
import { TRange, TSliderOptions } from './types';
import { SliderUtils } from './utils';

/**
 * A numeric value picked inside a range, by keyboard or pointer.
 *
 * Keyboard: arrows (Shift for a large step), PageUp/PageDown, Home/End. Pointer: call `pointerDown`/`pointerMove`/`pointerUp` with
 * the pointer's distance from the start of the track and the track length; the slider handles orientation and text direction.
 *
 * Anatomy: `parts.root()` wrapper, `parts.track()`, `parts.range()` (the filled part, sized with `ratio()`), `parts.thumb()` (`role="slider"`, focusable).
 * @example
 * const volume = new Slider({ min: 0, max: 100, value: 30 })
 * <div {...volume.parts.thumb()} onKeyDown={volume.keydown} style={{ left: `${volume.ratio() * 100}%` }} />
 */
class Slider extends Control<number> {
	/** Bounds and step. */
	readonly range: TRange;
	/** Distance for PageUp/PageDown and Shift+arrows. */
	readonly largeStep: number;
	/** Axis of the track. */
	readonly orientation: TOrientation;
	/** Text direction; in `rtl` the right arrow decreases. */
	readonly direction: TTextDirection;
	/** Position of the value in the range, from 0 to 1. */
	readonly ratio: Computed<number>;
	/** The value as text, through `format`. */
	readonly text: Computed<string>;
	/** True between `pointerDown` and `pointerUp`. */
	readonly dragging: Signal<boolean>;

	/** Adds `steps` steps. */
	readonly increment = (steps = 1): boolean => this.act(() => this.set(Signal.untracked(this.value) + steps * this.#step));
	/** Subtracts `steps` steps. */
	readonly decrement = (steps = 1): boolean => this.act(() => this.set(Signal.untracked(this.value) - steps * this.#step));
	/** Goes to `min`. */
	readonly toMinimum = (): boolean => this.act(() => this.set(this.range.min));
	/** Goes to `max`. */
	readonly toMaximum = (): boolean => this.act(() => this.set(this.range.max));
	/** Sets the value at a ratio from 0 to 1. */
	readonly setRatio = (ratio: number): boolean => this.act(() => this.set(SliderUtils.fromRatio(ratio, this.range)));

	/** Starts a drag at a pointer position on the track and jumps there. */
	readonly pointerDown = (offset: number, length: number): boolean => {
		if (!this.setRatio(this.#pointerRatio(offset, length))) return false;
		this.dragging.set(true);
		return true;
	};

	/** Follows the pointer while dragging; does nothing otherwise. */
	readonly pointerMove = (offset: number, length: number): boolean => {
		if (!Signal.untracked(this.dragging)) return false;
		return this.setRatio(this.#pointerRatio(offset, length));
	};

	/** Ends the drag. */
	readonly pointerUp = (): void => {
		this.dragging.set(false);
	};

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		root: (): TAttributes => ({
			id: this.id,
			'data-orientation': this.orientation,
			'data-disabled': HeadlessUtils.presence(this.disabled()),
			'data-dragging': HeadlessUtils.presence(this.dragging()),
		}),
		track: (): TAttributes => ({
			'data-orientation': this.orientation,
			'data-disabled': HeadlessUtils.presence(this.disabled()),
		}),
		range: (): TAttributes => ({
			'data-orientation': this.orientation,
		}),
		thumb: (): TAttributes => ({
			id: `${this.id}-thumb`,
			role: 'slider',
			tabindex: this.disabled() ? -1 : 0,
			'aria-valuemin': this.range.min,
			'aria-valuemax': this.range.max,
			'aria-valuenow': this.value(),
			'aria-valuetext': this.text(),
			'aria-orientation': this.orientation,
			'aria-disabled': HeadlessUtils.ariaFlag(this.disabled()),
			'aria-readonly': HeadlessUtils.ariaFlag(this.readOnly()),
			'data-orientation': this.orientation,
			'data-dragging': HeadlessUtils.presence(this.dragging()),
		}),
	};

	constructor(options: TSliderOptions = {}) {
		const range = { min: options.min ?? SLIDER_DEFAULTS.MIN, max: options.max ?? SLIDER_DEFAULTS.MAX, step: options.step ?? SLIDER_DEFAULTS.STEP };
		const value = typeof options.value === 'number' ? SliderUtils.normalize(options.value, range) : options.value;
		super('slider', { ...options, value }, range.min);
		this.range = range;
		this.largeStep = options.largeStep ?? this.#step * SLIDER_DEFAULTS.STEPS_PER_LARGE_STEP;
		this.orientation = options.orientation ?? 'horizontal';
		this.direction = options.direction ?? 'ltr';
		this.dragging = signal(false);
		this.ratio = computed(() => SliderUtils.ratio(this.value(), this.range));
		const format = options.format ?? String;
		this.text = computed(() => format(this.value()));
	}

	get #step(): number {
		return this.range.step ?? SLIDER_DEFAULTS.STEP;
	}

	protected override normalize(next: number, current: number): number {
		if (typeof next !== 'number' || Number.isNaN(next)) return current;
		return SliderUtils.normalize(next, this.range);
	}

	protected override handleKey(event: TKeyIntent): boolean {
		const forward = this.direction === 'rtl' ? KEYS.ARROW_LEFT : KEYS.ARROW_RIGHT;
		const backward = this.direction === 'rtl' ? KEYS.ARROW_RIGHT : KEYS.ARROW_LEFT;
		const multiplier = event.shiftKey ? this.largeStep / this.#step : 1;
		switch (event.key) {
			case forward:
			case KEYS.ARROW_UP:
				return this.increment(multiplier);
			case backward:
			case KEYS.ARROW_DOWN:
				return this.decrement(multiplier);
			case KEYS.PAGE_UP:
				return this.act(() => this.set(Signal.untracked(this.value) + this.largeStep));
			case KEYS.PAGE_DOWN:
				return this.act(() => this.set(Signal.untracked(this.value) - this.largeStep));
			case KEYS.HOME:
				return this.toMinimum();
			case KEYS.END:
				return this.toMaximum();
			default:
				return false;
		}
	}

	#pointerRatio(offset: number, length: number): number {
		return SliderUtils.pointerRatio(offset, length, this.orientation, this.direction);
	}
}

export { Slider };
