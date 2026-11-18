import { TControlOptions } from '../control/types';
import { TMaybeReactive } from '../types';

/** A page button in the page list. */
type TPaginationPage = {
	/** Discriminant. */
	readonly type: 'page';
	/** Page number, from 1. */
	readonly page: number;
	/** This is the current page. */
	readonly current: boolean;
};

/** A gap in the page list ("…"). */
type TPaginationEllipsis = {
	/** Discriminant. */
	readonly type: 'ellipsis';
	/** Whether the gap is before or after the current page. */
	readonly position: 'start' | 'end';
};

/** An entry of the page list: a page or a gap. */
type TPaginationItem = TPaginationPage | TPaginationEllipsis;

/** Options of a `Pagination`. The value is the current page, from 1. */
type TPaginationOptions = TControlOptions<number> & {
	/** Number of items being paged (not pages). Static or reactive. */
	readonly total: TMaybeReactive<number>;
	/** Items per page. Default 10. Static or reactive. */
	readonly pageSize?: TMaybeReactive<number>;
	/** Pages shown on each side of the current one. Default 1. */
	readonly siblings?: number;
	/** Pages always shown at each end. Default 1. */
	readonly boundaries?: number;
};

export type { TPaginationPage, TPaginationEllipsis, TPaginationItem, TPaginationOptions };
