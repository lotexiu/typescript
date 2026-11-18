import { ELLIPSIS_SLOT, PAGINATION_DEFAULTS } from './declarations';
import { TPaginationItem } from './types';

/** Pure page arithmetic and the list of page buttons with gaps. */
class PaginationUtils {
	/** Number of pages; at least 1, even with no items. */
	static pageCount(total: number, pageSize: number): number {
		if (pageSize <= 0 || total <= 0) return PAGINATION_DEFAULTS.FIRST_PAGE;
		return Math.max(PAGINATION_DEFAULTS.FIRST_PAGE, Math.ceil(total / pageSize));
	}

	/** Rounds a page number and keeps it inside `[1, pageCount]`. */
	static clamp(page: number, pageCount: number): number {
		if (!Number.isFinite(page)) return PAGINATION_DEFAULTS.FIRST_PAGE;
		return Math.min(pageCount, Math.max(PAGINATION_DEFAULTS.FIRST_PAGE, Math.round(page)));
	}

	/** Page numbers from `first` to `last`, inclusive. */
	static pages(first: number, last: number): number[] {
		const pages: number[] = [];
		for (let page = first; page <= last; page++) pages.push(page);
		return pages;
	}

	/**
	 * The page buttons to show: the ends, the current page with its siblings, and gaps between them.
	 * The list keeps the same length while the current page moves, so the buttons do not jump around.
	 * @example
	 * PaginationUtils.items(10, 20, 1, 1) // pages 1, …, 9, 10, 11, …, 20
	 */
	static items(page: number, pageCount: number, siblings: number, boundaries: number): TPaginationItem[] {
		const startPages = PaginationUtils.pages(1, Math.min(boundaries, pageCount));
		const endPages = PaginationUtils.pages(Math.max(pageCount - boundaries + 1, boundaries + 1), pageCount);
		const siblingsStart = Math.max(Math.min(page - siblings, pageCount - boundaries - siblings * 2 - ELLIPSIS_SLOT), boundaries + ELLIPSIS_SLOT + 1);
		const siblingsEnd = Math.min(Math.max(page + siblings, boundaries + siblings * 2 + ELLIPSIS_SLOT + 1), pageCount - boundaries - ELLIPSIS_SLOT);
		const startGap = siblingsStart > boundaries + ELLIPSIS_SLOT + 1 ? ['start' as const] : boundaries + 1 < pageCount - boundaries ? [boundaries + 1] : [];
		const endGap = siblingsEnd < pageCount - boundaries - ELLIPSIS_SLOT ? ['end' as const] : pageCount - boundaries > boundaries ? [pageCount - boundaries] : [];
		const sequence = [...startPages, ...startGap, ...PaginationUtils.pages(siblingsStart, siblingsEnd), ...endGap, ...endPages];
		return sequence.map((entry) =>
			typeof entry === 'number' ? { type: 'page', page: entry, current: entry === page } : { type: 'ellipsis', position: entry }
		);
	}
}

export { PaginationUtils };
