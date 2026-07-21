import { TValueCellListener, TValueCellUnsubscribe } from "@ts/value-cell/types";

/**
 * Contrato mínimo que todo plugin de componente segue: ler o valor atual e
 * ser avisado quando ele muda. Não define um método de escrita aqui de
 * propósito — cada plugin escolhe o próprio (parse/update/apply/...), porque
 * a forma de "escrever" varia por plugin (texto bruto, evento, valor tipado).
 */
interface TPlugin<T> {
	get value(): T;
	subscribe(listener: TValueCellListener<T>): TValueCellUnsubscribe;
}

export type {
	TPlugin
}
