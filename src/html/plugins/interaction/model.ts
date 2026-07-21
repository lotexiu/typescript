import { ValueCell } from "@ts/value-cell/model";
import { TValueCellListener, TValueCellUnsubscribe } from "@ts/value-cell/types";
import { TPlugin } from "../types";
import { TInteractionState } from "./types";

/**
 * InteractionPlugin
 * Responsabilidade única: rastrear o ciclo de interação de um campo — foi
 * focado, perdeu foco (touched), mudou (dirty). Não sabe nada de validação
 * nem do valor do campo; só quando/como foi interagido. Pensado pra
 * responder "já dá pra mostrar erro?" (normalmente: `touched && !focused`)
 * sem cada componente reimplementar esse controle na mão.
 */
class InteractionPlugin implements TPlugin<TInteractionState> {
	private cell = new ValueCell<TInteractionState>({ focused: false, touched: false, dirty: false });

	get value(): TInteractionState { return this.cell.value; }

	/** Subscribes to interaction-state changes. Returns an unsubscribe function. */
	subscribe(listener: TValueCellListener<TInteractionState>): TValueCellUnsubscribe {
		return this.cell.subscribe(listener);
	}

	/** Call when the field gains focus. */
	onFocus(): void {
		this.update({ focused: true });
	}

	/** Call when the field loses focus — marks it `touched`. */
	onBlur(): void {
		this.update({ focused: false, touched: true });
	}

	/** Call when the field's value changes — marks it `dirty`. */
	onChange(): void {
		this.update({ dirty: true });
	}

	/** Volta ao estado inicial — útil quando o campo é reaproveitado pra outro valor. */
	reset(): void {
		this.update({ focused: false, touched: false, dirty: false });
	}

	/** Só cria um novo objeto (e notifica) se algum campo realmente mudou. */
	private update(partial: Partial<TInteractionState>): void {
		const current = this.cell.value;
		const next = { ...current, ...partial };
		if (
			next.focused === current.focused &&
			next.touched === current.touched &&
			next.dirty === current.dirty
		) return;
		this.cell.set(next);
	}
}

export {
	InteractionPlugin
}
