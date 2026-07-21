import { NumberUtils } from "@tsn-number/utils";
import { MathUtils } from "@tsn-math/utils";
import { ValueCell } from "@ts/value-cell/model";
import { TValueCellListener, TValueCellUnsubscribe } from "@ts/value-cell/types";
import { TPlugin } from "../types";
import { TNumberPluginOptions } from "./types";

/**
 * NumberPlugin
 * Responsabilidade única: converter texto bruto em number (ou undefined),
 * opcionalmente restrito a um intervalo [min, max]. Não valida (não reporta
 * erro nem sinaliza "inválido") e não formata para exibição — isso é
 * trabalho de outros plugins, compostos por quem consome.
 *
 * min/max aqui é *correção* (o valor guardado já sai dentro do intervalo),
 * diferente de validação (que sinalizaria erro sem alterar o valor).
 */
class NumberPlugin implements TPlugin<number | undefined> {
	private cell = new ValueCell<number | undefined>(undefined);
	private min?: number;
	private max?: number;

	constructor(options: TNumberPluginOptions = {}) {
		this.min = options.min;
		this.max = options.max;
	}

	get value(): number | undefined { return this.cell.value; }

	subscribe(listener: TValueCellListener<number | undefined>): TValueCellUnsubscribe {
		return this.cell.subscribe(listener);
	}

	/** Recebe o texto bruto digitado, parseia via NumberUtils e aplica o clamp atual. */
	parse(raw: string): void {
		const parsed = NumberUtils.parse(raw);
		this.cell.set(parsed === undefined ? undefined : MathUtils.clamp(parsed, this.min, this.max));
	}

	/** Troca min/max em runtime e reaplica o clamp sobre o valor já armazenado. */
	setLimits(options: TNumberPluginOptions): void {
		this.min = options.min;
		this.max = options.max;

		const current = this.cell.value;
		if (current === undefined) return;
		this.cell.set(MathUtils.clamp(current, this.min, this.max));
	}
}

export {
	NumberPlugin
}
