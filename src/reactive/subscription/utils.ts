import { LocaleError } from '@ts/locale/error';
import { SUBSCRIPTION_LOCALES } from './declarations';
import { TListeners, TValueListener } from './types';

/**
 * @internal
 * Armazenamento de listeners sem `Set`: `undefined` (nenhum), a própria função (um — o caso mais
 * comum) ou um array (vários). Toda alteração cria um array novo (copy-on-write), então quem está
 * no meio de um `call` continua percorrendo a versão antiga sem se confundir com remoções.
 */
class ListenerUtils {
	static add<T>(current: TListeners<T>, listener: TValueListener<T>): TListeners<T> {
		if (current === undefined) return listener;
		if (typeof current === 'function') return [current, listener];
		return [...current, listener];
	}

	// Remove uma ocorrência de `listener`; devolve `current` intacto se ele não estiver lá.
	static remove<T>(current: TListeners<T>, listener: TValueListener<T>): TListeners<T> {
		if (current === listener) return undefined;
		if (current === undefined || typeof current === 'function') return current;
		const index = current.indexOf(listener);
		if (index < 0) return current;
		if (current.length === 2) return current[1 - index];
		const next = current.slice();
		next.splice(index, 1);
		return next;
	}

	// Um listener com erro não impede os outros de rodar. Os erros vão para `errors` (quem chama
	// junta vários lotes e lança no fim) ou, sem `errors`, são lançados aqui depois do laço.
	static call<T>(current: TListeners<T>, value: T, errors?: unknown[]): void {
		if (current === undefined) return;
		if (typeof current === 'function') {
			if (errors === undefined) return current(value);
			try {
				current(value);
			} catch (error) {
				errors.push(error);
			}
			return;
		}
		const collected = errors ?? [];
		for (let i = 0; i < current.length; i++) {
			try {
				current[i](value);
			} catch (error) {
				collected.push(error);
			}
		}
		if (errors === undefined) ListenerUtils.throwAll(collected);
	}

	static throwAll(errors: unknown[]): void {
		if (errors.length === 1) throw errors[0];
		if (errors.length > 1) {
			throw new AggregateError(errors, new LocaleError(SUBSCRIPTION_LOCALES, 'manyListenersFailed').message);
		}
	}
}

export { ListenerUtils };
