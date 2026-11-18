/**
 * @internal
 */
const PAGINATION_DEFAULTS = {
	PAGE_SIZE: 10,
	SIBLINGS: 1,
	BOUNDARIES: 1,
	FIRST_PAGE: 1,
} as const;

/**
 * @internal
 */
const ELLIPSIS_SLOT = 1;

export { PAGINATION_DEFAULTS, ELLIPSIS_SLOT };
