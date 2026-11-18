/** `KeyboardEvent.key` values the headless controls react to. */
const KEYS = {
	ARROW_UP: 'ArrowUp',
	ARROW_DOWN: 'ArrowDown',
	ARROW_LEFT: 'ArrowLeft',
	ARROW_RIGHT: 'ArrowRight',
	HOME: 'Home',
	END: 'End',
	PAGE_UP: 'PageUp',
	PAGE_DOWN: 'PageDown',
	ENTER: 'Enter',
	SPACE: ' ',
	ESCAPE: 'Escape',
	TAB: 'Tab',
} as const;

/**
 * @internal
 */
const TYPEAHEAD_TIMEOUT_MILLISECONDS = 500;

/**
 * @internal
 */
const PRINTABLE_KEY_LENGTH = 1;

export { KEYS, TYPEAHEAD_TIMEOUT_MILLISECONDS, PRINTABLE_KEY_LENGTH };
