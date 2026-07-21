import { ValueCell } from "@ts/value-cell/model";
import { TValueCellListener, TValueCellUnsubscribe } from "@ts/value-cell/types";
import { TVariantDerive } from "./types";

/**
 * Alterna entre variantes nomeadas de um mesmo tipo de valor — paleta de cor,
 * conjunto de componentes visuais, etc. Um `ValueCell<TName>` decide qual nome
 * está ativo; `derive` resolve o valor daquele nome sob demanda, com o
 * resultado guardado em cache por nome (ex.: uma paleta é gerada uma única
 * vez por tema, não recalculada a cada leitura). `subscribe` notifica com o
 * nome ativo, não o valor derivado — quem consome decide se/quando recomputar
 * o valor a partir do nome (ex.: `useMemo` num hook React).
 */
class VariantCell<TName extends string, TValue> {
	private cell: ValueCell<TName>;
	private cache = new Map<TName, TValue>();

	constructor(private derive: TVariantDerive<TName, TValue>, initial: TName) {
		this.cell = new ValueCell(initial);
	}

	get active(): TName { return this.cell.value; }

	get value(): TValue {
		const name = this.cell.value;
		const cached = this.cache.get(name);
		if (cached !== undefined) return cached;
		const value = this.derive(name);
		this.cache.set(name, value);
		return value;
	}

	set(name: TName): void { this.cell.set(name); }

	subscribe(listener: TValueCellListener<TName>): TValueCellUnsubscribe {
		return this.cell.subscribe(listener);
	}
}

export {
	VariantCell,
}
