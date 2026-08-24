import { MS_CONVERTIONS } from "./declarations";

/**
 * @internal
*/
class _Date {
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

	formatMS(ms: number) {
		const [unit, _, factor] = (MS_CONVERTIONS.find(([_,threshold]) => ms < threshold) ?? MS_CONVERTIONS.at(-1)!)
		return `${Math.round(ms * factor)} ${unit}`;
	}
}

const parseISO = _Date.parseISO;

export {
	_Date,
	parseISO,
}
