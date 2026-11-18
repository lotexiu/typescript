import { describe, it, expect } from 'vitest';
import { Pagination } from '@ts/headless/pagination/model';
import { PaginationUtils } from '@ts/headless/pagination/utils';
import { TPaginationItem } from '@ts/headless/pagination/types';
import { signal } from '@tsr-node/signal/model';

function compact(items: readonly TPaginationItem[]): (number | string)[] {
	return items.map((item) => (item.type === 'page' ? item.page : '…'));
}

describe('PaginationUtils.items', () => {
	it('shows every page when they fit', () => {
		expect(compact(PaginationUtils.items(1, 7, 1, 1))).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('puts ellipses where pages were left out, keeping a constant length', () => {
		expect(compact(PaginationUtils.items(1, 20, 1, 1))).toEqual([1, 2, 3, 4, 5, '…', 20]);
		expect(compact(PaginationUtils.items(10, 20, 1, 1))).toEqual([1, '…', 9, 10, 11, '…', 20]);
		expect(compact(PaginationUtils.items(20, 20, 1, 1))).toEqual([1, '…', 16, 17, 18, 19, 20]);
		expect(compact(PaginationUtils.items(10, 20, 2, 2))).toEqual([1, 2, '…', 8, 9, 10, 11, 12, '…', 19, 20]);
	});

	it('handles a single page', () => {
		expect(compact(PaginationUtils.items(1, 1, 1, 1))).toEqual([1]);
	});
});

describe('Pagination', () => {
	it('counts pages, the item slice and the edges', () => {
		const pagination = new Pagination({ total: 95, pageSize: 10 });
		expect(pagination.pageCount()).toBe(10);
		expect(pagination.canPrevious()).toBe(false);
		pagination.last();
		expect(pagination.page()).toBe(10);
		expect([pagination.start(), pagination.end()]).toEqual([90, 95]);
		expect(pagination.next()).toBe(true);
		expect(pagination.page()).toBe(10);
		expect(pagination.parts.next()['aria-disabled']).toBe('true');
	});

	it('clamps the page when the total shrinks', () => {
		const total = signal(100);
		const pagination = new Pagination({ total, value: 8 });
		total.set(25);
		expect(pagination.page()).toBe(3);
		expect(pagination.parts.page(3)['aria-current']).toBe('page');
	});

	it('rounds and clamps requested pages', () => {
		const pagination = new Pagination({ total: 30 });
		pagination.goTo(2.4);
		expect(pagination.page()).toBe(2);
		pagination.goTo(99);
		expect(pagination.page()).toBe(3);
		pagination.goTo(-4);
		expect(pagination.page()).toBe(1);
	});
});
