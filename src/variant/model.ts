import { derived, signal } from '@ts/signal/model';
import { TDerived, TSignal } from '@ts/signal/types';
import { TValueListener, TValueUnsubscribe } from '@ts/subscription/types';
import { TVariantDerive } from './types';

// Chave ativa + valor derivado dela: trocar a chave recalcula o valor (sob demanda).
class Variant<K, V> {
	readonly #key: TSignal<K>;
	readonly #value: TDerived<V>;
	#prevKey?: K;
	#prevValue?: V;
	#lastValue?: V;

	constructor(derive: TVariantDerive<K, V>, initial: K) {
		this.#key = signal(initial);
		this.#value = derived(() => {
			const next = derive(this.#key());
			this.#prevValue = this.#lastValue;
			this.#lastValue = next;
			return next;
		});
	}

	// Leituras reativas: dentro de um derived, viram dependência.
	key(): K {
		return this.#key();
	}

	value(): V {
		return this.#value();
	}

	// Leituras pontuais (não reativas) do estado anterior.
	get prevKey(): K | undefined {
		return this.#prevKey;
	}

	get prevValue(): V | undefined {
		this.#value();
		return this.#prevValue;
	}

	set(key: K): boolean {
		const previous = this.#key();
		if (!this.#key.set(key)) return false;
		this.#prevKey = previous;
		return true;
	}

	// Chamado com o novo valor quando ele muda.
	subscribe(listener: TValueListener<V>): TValueUnsubscribe {
		return this.#value.subscribe(listener);
	}

	dispose(): void {
		this.#value.dispose();
		this.#key.dispose();
	}
}

function variant<K, V>(derive: TVariantDerive<K, V>, initial: K): Variant<K, V> {
	return new Variant(derive, initial);
}

export { Variant, variant };
