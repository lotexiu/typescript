import { MaskUtils } from "@ts/mask/utils";
import { ValueCell } from "@ts/value-cell/model";
import { TValueCellListener, TValueCellUnsubscribe } from "@ts/value-cell/types";
import { TPlugin } from "../types";

/**
 * MaskPlugin
 * Não reimplementa lógica de máscara — delega inteiramente ao MaskUtils já
 * existente e testado. O plugin só adapta: guarda o texto raw (sem máscara)
 * como fonte de verdade e o texto exibido como derivado dele, notificando
 * assinantes quando o texto exibido muda. Se a lógica de máscara mudar,
 * muda em MaskUtils; este plugin não precisa saber.
 */
class MaskPlugin implements TPlugin<string> {
	private raw: string;
	private cell: ValueCell<string>;

	constructor(private pattern: string, initialValue: string = "") {
		this.raw = MaskUtils.unapply(initialValue, pattern);
		this.cell = new ValueCell(MaskUtils.apply(this.raw, pattern));
	}

	get value(): string { return this.cell.value; }

	/** Subscribes to the formatted display value's changes. Returns an unsubscribe function. */
	subscribe(listener: TValueCellListener<string>): TValueCellUnsubscribe {
		return this.cell.subscribe(listener);
	}

	/** Recebe o texto que o usuário digitou/colou e reaplica a máscara atual. */
	update(display: string): void {
		this.raw = MaskUtils.unapply(display, this.pattern);
		this.cell.set(MaskUtils.apply(this.raw, this.pattern));
	}

	/** Troca o pattern em runtime e reformata o raw já digitado contra o pattern novo. */
	setPattern(pattern: string): void {
		if (pattern === this.pattern) return;
		this.pattern = pattern;
		this.cell.set(MaskUtils.apply(this.raw, pattern));
	}
}

export {
	MaskPlugin
}
