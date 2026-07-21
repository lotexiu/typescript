/**
 * @internal
*/
class _Date {
	/**
	 * Parse estrito de "yyyy-mm-dd" (ISO 8601, data). undefined se vazio, mal
	 * formatado, ou data de calendário inválida (ex.: 2024-02-30 não vira
	 * março, é rejeitada). Não tenta adivinhar outros formatos de propósito.
	 */
	static parseISO(raw: string): Date | undefined {
		const trimmed = raw.trim();
		if (trimmed === "") return undefined;

		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
		if (!match) return undefined;

		const year = Number(match[1]);
		const month = Number(match[2]);
		const day = Number(match[3]);
		const date = new Date(Date.UTC(year, month - 1, day));

		const isRealCalendarDate =
			date.getUTCFullYear() === year &&
			date.getUTCMonth() === month - 1 &&
			date.getUTCDate() === day;

		return isRealCalendarDate ? date : undefined;
	}
}

/** Strict "yyyy-mm-dd" (ISO 8601 date) parse — `undefined` if empty, malformed, or not a real calendar date (e.g. 2024-02-30 is rejected, not rolled into March). */
const parseISO = _Date.parseISO;

export {
	_Date,
	parseISO,
}
