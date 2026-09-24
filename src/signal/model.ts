import { TValueListener } from '@ts/subscription/types';
import { ReactiveNode } from './node';
import { TDerived, TEqual, TSignal } from './types';

// A instância é uma função comum com os métodos pendurados como propriedades — sem classe e sem
// trocar o prototype (`Object.setPrototypeOf` numa função custa ~10x o resto da criação).
// Os métodos são funções compartilhadas que acham o nó por este símbolo: nenhuma closure extra
// por instância. Como qualquer método, dependem de `this` (não funcionam soltos da instância).
const NODE = Symbol('node');

type TWithNode<T> = { [NODE]: ReactiveNode<T> };

function set<T>(this: TWithNode<T>, next: T): boolean {
	return this[NODE].write(next);
}

function update<T>(this: TWithNode<T>, fn: (value: T) => T): boolean {
	const node = this[NODE];
	return node.write(fn(node.peek()));
}

function notify<T>(this: TWithNode<T>): void {
	this[NODE].notify();
}

function subscribe<T>(this: TWithNode<T>, listener: TValueListener<T>) {
	return this[NODE].subscribe(listener);
}

function dispose<T>(this: TWithNode<T>): void {
	this[NODE].dispose();
}

function signal<T>(initial: T, equal?: TEqual<T>): TSignal<T> {
	const node = ReactiveNode.source(initial, equal);
	const instance: any = () => node.read();
	instance[NODE] = node;
	instance.set = set;
	instance.update = update;
	instance.notify = notify;
	instance.subscribe = subscribe;
	instance.dispose = dispose;
	return instance;
}

function derived<T>(compute: () => T, equal?: TEqual<T>): TDerived<T> {
	const node = ReactiveNode.derived(compute, equal);
	const instance: any = () => node.read();
	instance[NODE] = node;
	instance.subscribe = subscribe;
	instance.dispose = dispose;
	return instance;
}

// `x instanceof Signal` / `x instanceof Derived`: signal é quem tem nó e `set`; derived, nó sem `set`.
const Signal = {
	// Agrupa escritas: os listeners só são chamados uma vez, quando o lote mais externo termina.
	batch: <R>(fn: () => R): R => ReactiveNode.batch(fn),
	// Lê sem registrar dependência. Como signals são funções, `Signal.untracked(s)` também funciona.
	untracked: <R>(fn: () => R): R => ReactiveNode.untracked(fn),
	[Symbol.hasInstance]: (value: any): boolean => typeof value === 'function' && value.set === set,
};

const Derived = {
	[Symbol.hasInstance]: (value: any): boolean =>
		typeof value === 'function' && value[NODE] !== undefined && value.set !== set,
};

export { Signal, Derived, signal, derived };
