import { describe, it, expect } from 'vitest';
import { pagination } from '@ts/headless/pagination/model';
import { signal } from '@tsr-node/signal/model';

describe('pagination.totalPages', () => {
	it('is ceil(totalItems / pageSize), at least 1', () => {
		expect(pagination({ totalItems: 95, pageSize: 10 }).totalPages()).toBe(10);
		expect(pagination({ totalItems: 0, pageSize: 10 }).totalPages()).toBe(1);
	});
});

describe('pagination.goToPage / nextPage / previousPage', () => {
	it('clamps to [1, totalPages]', () => {
		const p = pagination({ totalItems: 30, pageSize: 10 }); // 3 pages
		p.goToPage(99);
		expect(p.currentPage()).toBe(3);
		p.goToPage(-5);
		expect(p.currentPage()).toBe(1);
	});

	it('goToPage() returns whether the page actually changed', () => {
		const p = pagination({ totalItems: 30, pageSize: 10 });
		expect(p.goToPage(2)).toBe(true);
		expect(p.goToPage(2)).toBe(false);
	});

	it('nextPage()/previousPage() step by one and stop at the edges', () => {
		const p = pagination({ totalItems: 20, pageSize: 10 }); // 2 pages
		p.previousPage();
		expect(p.currentPage()).toBe(1);
		p.nextPage();
		expect(p.currentPage()).toBe(2);
		p.nextPage();
		expect(p.currentPage()).toBe(2);
	});

	it('hasNext/hasPrevious reflect the current position', () => {
		const p = pagination({ totalItems: 20, pageSize: 10 });
		expect(p.hasPrevious()).toBe(false);
		expect(p.hasNext()).toBe(true);
		p.nextPage();
		expect(p.hasPrevious()).toBe(true);
		expect(p.hasNext()).toBe(false);
	});
});

describe('pagination re-clamping', () => {
	it('pulls `currentPage` back when a reactive `totalItems` shrinks below it', () => {
		const totalItems = signal(100);
		const p = pagination({ totalItems, pageSize: 10 });
		p.goToPage(10);
		totalItems.set(25); // now only 3 pages
		expect(p.currentPage()).toBe(3);
	});
});

describe('pagination.visiblePages', () => {
	it('lists every page when totalPages is 7 or fewer', () => {
		const p = pagination({ totalItems: 70, pageSize: 10 }); // 7 pages
		expect(p.visiblePages()).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('collapses into a window with ellipses around the current page when there are more than 7 pages', () => {
		const p = pagination({ totalItems: 100, pageSize: 10 }); // 10 pages
		p.goToPage(5);
		expect(p.visiblePages()).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]);
	});

	it('drops the leading ellipsis when the current page is near the start', () => {
		const p = pagination({ totalItems: 100, pageSize: 10 });
		p.goToPage(1);
		expect(p.visiblePages()).toEqual([1, 2, 'ellipsis', 10]);
	});

	it('drops the trailing ellipsis when the current page is near the end', () => {
		const p = pagination({ totalItems: 100, pageSize: 10 });
		p.goToPage(10);
		expect(p.visiblePages()).toEqual([1, 'ellipsis', 9, 10]);
	});
});
