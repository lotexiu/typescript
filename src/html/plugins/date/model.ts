import { DateUtils } from "@tsn-date/utils";
import { ValueCell } from "@ts/value-cell/model";
import { TValueCellListener, TValueCellUnsubscribe } from "@ts/value-cell/types";
import { TPlugin } from "../types";
import { TDateParseFn, TDatePluginOptions } from "./types";

/**
 * DatePlugin
 * Responsabilidade única: converter texto bruto em Date (ou undefined).
 * Padrão: ISO estrito (yyyy-mm-dd) — nenhuma tentativa de adivinhar formato
 * local (DD/MM vs MM/DD, fuso, ano de 2 dígitos). Pra qualquer outro formato,
 * passe sua própria função via `parse`. Não valida nem formata pra exibição
 * — isso é trabalho de outros plugins, compostos por quem consome.
 */
class DatePlugin implements TPlugin<Date | undefined> {
	private cell = new ValueCell<Date | undefined>(undefined);
	private parseFn: TDateParseFn;

	constructor(options: TDatePluginOptions = {}) {
		this.parseFn = options.parse ?? DateUtils.parseISO;
	}

	get value(): Date | undefined { return this.cell.value; }

	/** Subscribes to value changes. Returns an unsubscribe function. */
	subscribe(listener: TValueCellListener<Date | undefined>): TValueCellUnsubscribe {
		return this.cell.subscribe(listener);
	}

	/** Recebe o texto bruto digitado e tenta parsear como Date. */
	parse(raw: string): void {
		this.cell.set(this.parseFn(raw));
	}

	/** Troca a função de parse em runtime (ex.: mudar de formato aceito). */
	setParse(parse: TDateParseFn): void {
		this.parseFn = parse;
	}
}

export {
	DatePlugin
}
