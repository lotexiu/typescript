/**
 * @internal
 */
const SERVICE_REGEX = {
	ROUTE_RESERVED_CHARACTERS: new RegExp('[.+^${}()|[\\]\\\\]', 'g'),
	ROUTE_WILDCARD: new RegExp('\\*', 'g'),
} as const;

export { SERVICE_REGEX };
