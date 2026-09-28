import { Computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';

type TPaginationConfig = {
	totalItems?: TReactive<number> | number;
	pageSize?: TReactive<number> | number;
	initialPage?: number;
};

/** A page number, or `'ellipsis'` for a collapsed run of pages in `visiblePages`. */
type TPaginationPage = number | 'ellipsis';

type TPagination = {
	currentPage: Signal<number>;
	totalPages: Computed<number>;
	/** First page, last page, up to 1 page on either side of `currentPage`, `'ellipsis'` for the gaps. Every page when `totalPages` is small enough that nothing needs collapsing. */
	visiblePages: Computed<TPaginationPage[]>;
	hasNext: Computed<boolean>;
	hasPrevious: Computed<boolean>;
	/** Clamps to `[1, totalPages]`. Returns whether the page actually changed. */
	goToPage(page: number): boolean;
	nextPage(): void;
	previousPage(): void;
};

export type { TPaginationConfig, TPaginationPage, TPagination };
