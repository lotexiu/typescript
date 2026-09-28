import { StringUtils } from '@tsn-string/utils';

class SelectUtils {
	/** Case- and accent-insensitive substring match, used as the default local filter. */
	static matchesQuery(label: string, query: string): boolean {
		return StringUtils.noAccent(label).toLowerCase().includes(StringUtils.noAccent(query).toLowerCase());
	}
}

export { SelectUtils };
