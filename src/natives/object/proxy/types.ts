/** The kind of change a property mutation represents, passed to `proxyHandler` listeners. */
type TPropertyState = "new" | "updated" | "deleted" | "defined";

/** Change payload passed to a `proxyHandler` listener: which property changed, its new/previous value, and the kind of change. */
interface TProperty<T, Key extends keyof T = keyof T> {
	name: Key;
	value: T[Key];
	previousValue: T[Key];
	state: TPropertyState;
}

/** Listener signature for a `TProperty<T, K>` change. */
type TProxyCallFunction<T, K extends keyof T> = (
	property: TProperty<T, K>,
) => void;

/** Configuration for `proxyHandler` — global and per-property change listeners, and whether/how nested object properties get their own reactive proxy. */
type TProxyOptions<T> = {
	/** Envolve toda propriedade-objeto num proxy aninhado, não só as listadas em `properties`. */
	allProxy?: boolean;
	onChanges?: (property: TProperty<T>) => void;
	properties?: {
		[K in keyof T]?: {
			/** Força proxy aninhado nesta propriedade específica, mesmo sem `allProxy`. */
			proxyVariable?: boolean;
			onChanges?: (property: TProperty<T[K]>) => void;
			onSet?: (value: any) => void;
			onGet?: (value: any) => any;
			/** Opções repassadas ao proxy aninhado desta propriedade, se houver. */
			options?: TProxyOptions<T[K]>;
		};
	};
};

export type {
	TProperty,
	TPropertyState,
	TProxyOptions,
	TProxyCallFunction,
}
