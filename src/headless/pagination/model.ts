import { Computed, computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';
import { Control } from '../control/model';
import { TAttributes } from '../types';
import { HeadlessUtils } from '../utils';
import { PAGINATION_DEFAULTS } from './declarations';
import { TPaginationItem, TPaginationOptions } from './types';
import { PaginationUtils } from './utils';

/**
 * Current page over a number of items, with the page list to render and the slice of items to show.
 *
 * Anatomy: `parts.previous()`, `parts.next()` on the arrows, `parts.page(n)` on each page button (`aria-current`).
 * @example
 * const pages = new Pagination({ total: rows.length, pageSize: 20 })
 * rows.slice(pages.start(), pages.end())
 */
class Pagination extends Control<number> {
	/** Number of items. */
	readonly total: TReactive<number>;
	/** Items per page. */
	readonly pageSize: TReactive<number>;
	/** Number of pages. */
	readonly pageCount: Computed<number>;
	/** Current page, always valid even when `total` shrinks. */
	readonly page: Computed<number>;
	/** The page buttons and gaps to render. */
	readonly items: Computed<readonly TPaginationItem[]>;
	/** There is a page before. */
	readonly canPrevious: Computed<boolean>;
	/** There is a page after. */
	readonly canNext: Computed<boolean>;
	/** Index of the first item of the current page. */
	readonly start: Computed<number>;
	/** Index after the last item of the current page (for `slice`). */
	readonly end: Computed<number>;

	/** Goes to a page (rounded and clamped). */
	readonly goTo = (page: number): boolean => this.act(() => this.set(page));
	/** Goes to the next page. */
	readonly next = (): boolean => this.goTo(Signal.untracked(this.page) + 1);
	/** Goes to the previous page. */
	readonly previous = (): boolean => this.goTo(Signal.untracked(this.page) - 1);
	/** Goes to page 1. */
	readonly first = (): boolean => this.goTo(PAGINATION_DEFAULTS.FIRST_PAGE);
	/** Goes to the last page. */
	readonly last = (): boolean => this.goTo(Signal.untracked(this.pageCount));

	/**
	 * Attributes for each part of the control, to spread on the elements you render (see the class description for the anatomy).
	 */
	readonly parts = {
		previous: (): TAttributes => ({
			'aria-disabled': HeadlessUtils.ariaFlag(!this.canPrevious() || this.disabled()),
			'data-disabled': HeadlessUtils.presence(!this.canPrevious() || this.disabled()),
		}),
		next: (): TAttributes => ({
			'aria-disabled': HeadlessUtils.ariaFlag(!this.canNext() || this.disabled()),
			'data-disabled': HeadlessUtils.presence(!this.canNext() || this.disabled()),
		}),
		page: (page: number): TAttributes => ({
			'aria-current': page === this.page() ? 'page' : undefined,
			'data-selected': HeadlessUtils.presence(page === this.page()),
		}),
	};

	constructor(options: TPaginationOptions) {
		super('pagination', options, PAGINATION_DEFAULTS.FIRST_PAGE);
		const siblings = options.siblings ?? PAGINATION_DEFAULTS.SIBLINGS;
		const boundaries = options.boundaries ?? PAGINATION_DEFAULTS.BOUNDARIES;
		this.total = HeadlessUtils.reactive(options.total);
		this.pageSize = HeadlessUtils.reactive(options.pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE);
		this.pageCount = computed(() => PaginationUtils.pageCount(this.total(), this.pageSize()));
		this.page = computed(() => PaginationUtils.clamp(this.value(), this.pageCount()));
		this.items = computed(() => PaginationUtils.items(this.page(), this.pageCount(), siblings, boundaries));
		this.canPrevious = computed(() => this.page() > PAGINATION_DEFAULTS.FIRST_PAGE);
		this.canNext = computed(() => this.page() < this.pageCount());
		this.start = computed(() => Math.min(this.total(), (this.page() - 1) * this.pageSize()));
		this.end = computed(() => Math.min(this.total(), this.page() * this.pageSize()));
	}

	protected override normalize(next: number): number {
		return PaginationUtils.clamp(next, Signal.untracked(this.pageCount));
	}
}

export { Pagination };
