import { MaskUtils } from "@ts/mask/utils";
import { TPlugin } from "../types";
import { TValueListener, TValueUnsubscribe } from "@ts/reactive/types";
import { Model, model } from "@ts/reactive/model/model";

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
	private cell: Model<string>;

	constructor(private pattern: string, initialValue: string = "") {
		this.raw = MaskUtils.unapply(initialValue, pattern);
		this.cell = model(MaskUtils.apply(this.raw, pattern));
	}

	get value(): string { return this.cell.value; }

	/** Subscribes to the formatted display value's changes. Returns an unsubscribe function. */
	subscribe(listener: TValueListener<string>): TValueUnsubscribe {
		return this.cell.subscribe(listener);
	}

	/** Recebe o texto que o usuário digitou/colou e reaplica a máscara atual. */
	tryUpdate(display: string): void {
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
