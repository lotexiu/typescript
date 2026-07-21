import { ValueCell } from "@ts/value-cell/model";
import { TValueCellListener, TValueCellUnsubscribe } from "@ts/value-cell/types";
import { debounce } from "@ts/filters/implementations";
import { TDebounceFn } from "@ts/filters/types";
import { TPlugin } from "../types";
import { TAsyncCheckFn, TAsyncCheckState } from "./types";

/**
 * O terceiro estado ("pendente") que uma checagem assíncrona (ex.: existe
 * esse e-mail no servidor?) precisa e que uma checagem síncrona
 * (`ValidationUtils`) não tem por quê modelar. Não reimplementa debounce —
 * usa o `debounce()` já existente. Descarta respostas desatualizadas via um
 * token crescente: se `request()` disparar de novo antes da checagem anterior
 * responder, só o resultado da checagem mais recente é aplicado.
 */
class AsyncCheckPlugin<TInput, TResult> implements TPlugin<TAsyncCheckState<TResult>> {
	private cell = new ValueCell<TAsyncCheckState<TResult>>({ status: "idle" });
	private token = 0;
	private debounced: TDebounceFn<(input: TInput) => void>;

	constructor(private check: TAsyncCheckFn<TInput, TResult>, debounceMs: number = 300) {
		this.debounced = debounce((input: TInput) => this.run(input), debounceMs);
	}

	get value(): TAsyncCheckState<TResult> { return this.cell.value; }

	/** Subscribes to state changes. Returns an unsubscribe function. */
	subscribe(listener: TValueCellListener<TAsyncCheckState<TResult>>): TValueCellUnsubscribe {
		return this.cell.subscribe(listener);
	}

	/** Marca "pendente" já e dispara (com debounce) uma nova checagem para `input`. */
	request(input: TInput): void {
		this.cell.set({ status: "pending" });
		this.debounced(input);
	}

	/** Cancela qualquer checagem pendente/em voo e volta pro estado inicial. */
	reset(): void {
		this.debounced.clear();
		this.token++;
		this.cell.set({ status: "idle" });
	}

	private async run(input: TInput): Promise<void> {
		const token = ++this.token;
		try {
			const result = await this.check(input);
			if (token !== this.token) return;
			this.cell.set({ status: "resolved", result });
		} catch (error) {
			if (token !== this.token) return;
			this.cell.set({ status: "rejected", error });
		}
	}
}

export {
	AsyncCheckPlugin,
}
