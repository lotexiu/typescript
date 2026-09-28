import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { TPagination, TPaginationConfig, TPaginationPage } from './types';

function pagination(config: TPaginationConfig = {}): TPagination {
	const { totalItems = 0, pageSize = 10, initialPage = 1 } = config;
	const readTotalItems = typeof totalItems === 'number' ? () => totalItems : totalItems;
	const readPageSize = typeof pageSize === 'number' ? () => pageSize : pageSize;

	const totalPages = computed(() => Math.max(1, Math.ceil(readTotalItems() / readPageSize())));
	const currentPage = signal(Math.min(Math.max(initialPage, 1), totalPages()));

	// re-clamp when the total shrinks below the current page (e.g. a filter reduces totalItems)
	totalPages.subscribe((total) => {
		if (currentPage() > total) currentPage.set(total);
	});

	function goToPage(page: number): boolean {
		const clamped = Math.min(Math.max(page, 1), totalPages());
		if (clamped === currentPage()) return false;
		currentPage.set(clamped);
		return true;
	}

	function nextPage(): void {
		goToPage(currentPage() + 1);
	}

	function previousPage(): void {
		goToPage(currentPage() - 1);
	}

	const hasNext = computed(() => currentPage() < totalPages());
	const hasPrevious = computed(() => currentPage() > 1);

	const visiblePages = computed<TPaginationPage[]>(() => {
		const total = totalPages();
		const current = currentPage();
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

		const pages: TPaginationPage[] = [1];
		if (current > 3) pages.push('ellipsis');

		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);
		for (let page = start; page <= end; page++) pages.push(page);

		if (current < total - 2) pages.push('ellipsis');
		pages.push(total);
		return pages;
	});

	return { currentPage, totalPages, visiblePages, hasNext, hasPrevious, goToPage, nextPage, previousPage };
}

export { pagination };
