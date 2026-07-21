import { TObject } from "@tsn-object/types";
import { TProxyOptions } from "./types";

function isProxyKey(property: string | number | symbol): boolean {
	return (
		property.toString().startsWith("__") &&
		property.toString().endsWith("Proxy")
	);
}

function getProxyKey<T extends string | number | symbol>(
	property: T,
): `__${T & string}Proxy` {
	return `__${property.toString()}Proxy` as any;
}

function isProxyEnabled<T extends object, P extends keyof T>(
	options: TProxyOptions<T>,
	property: P,
): boolean {
	if (isProxyKey(property)) return false;
	return !!(
		options.allProxy ||
		options.properties?.[property]?.proxyVariable ||
		options.properties?.[property]?.onChanges
	);
}

function createProxyProperty<
	T extends object,
	P extends keyof T,
	V extends T[P],
>(options: TProxyOptions<T>, target: T, property: P): V {
	const proxyProperty = getProxyKey(property) as P;
	if (
		target[property] &&
		!target[proxyProperty] &&
		typeof target[property] === "object"
	) {
		const explicitOptions = options.properties?.[property]?.options;
		// Sem config explícita pra essa propriedade: se o motivo de proxiar foi
		// `allProxy`, propaga allProxy+onChanges pro aninhado (senão "allProxy"
		// não seria de verdade "tudo reativo", só o primeiro nível). Se o motivo
		// foi um `onChanges` pontual desta propriedade, não propaga adiante —
		// era uma escuta pontual, não um pedido de reatividade profunda.
		const nestedOptions: TProxyOptions<V> = (
			explicitOptions ??
			(options.allProxy ? { allProxy: true, onChanges: options.onChanges } : {})
		) as any;
		target[proxyProperty] = proxyHandler(target[property], nestedOptions as any) as any;
	}
	return target[proxyProperty] as V;
}

function get<T extends object, P extends keyof T, V extends T[P]>(
	options: TProxyOptions<T>,
	target: T,
	property: P,
	proxy: T,
): V {
	let value: V = target[property] as V;
	if (value) {
		const descriptor = Object.getOwnPropertyDescriptor(target, property);
		const isConfigurable = !descriptor || descriptor.configurable !== false;

		switch (typeof value) {
			case "function":
				// Rebinda o método ao proxy (não ao target cru) na primeira leitura,
				// e memoriza o resultado — assim `this.algo = x` dentro de qualquer
				// método passa pelo proxy e dispara reatividade, sem precisar que
				// quem consome rebind manualmente método por método.
				if (isConfigurable && !(value as any).fn) {
					const bound = (value as any).rebind(proxy);
					Object.defineProperty(target, property, {
						value: bound,
						writable: true,
						configurable: true,
					});
					value = bound as V;
				}
				break;
			case "object":
				if (isConfigurable && isProxyEnabled<T, P>(options, property)) {
					value = createProxyProperty(options, target, property) as V;
				}
				break;
		}
	}
	if (!isProxyKey(property)) {
		const returnedValue = options.properties?.[property]?.onGet?.(value);
		if (returnedValue !== undefined) return returnedValue;
	}
	return value;
}

function set<T extends object, P extends keyof T, V extends T[P]>(
	options: TProxyOptions<T>,
	target: T,
	property: P,
	value: V,
): boolean {
	const previousValue = target[property];
	if (previousValue === value) return true;

	// Invalida o proxy aninhado cacheado (se houver) em vez de tentar recriá-lo
	// aqui com o valor antigo — get() recria sob demanda, corretamente, contra
	// o valor novo na próxima leitura. Isso também elimina a necessidade de
	// chamar deleteProxy() manualmente antes de reatribuir a propriedade.
	if (!isProxyKey(property)) {
		delete target[getProxyKey(property) as P];
	}

	target[property] = value;

	if (!isProxyKey(property)) {
		options.properties?.[property]?.onSet?.(value);
		options.onChanges?.({
			name: property,
			value: value,
			previousValue: previousValue,
			state: "updated",
		});
	}
	return true;
}

function defineProperty<T extends object, P extends keyof T, V extends T[P]>(
	options: TProxyOptions<T>,
	target: T,
	property: P,
	attributes: PropertyDescriptor,
): boolean {
	const previousValue = target[property];
	Object.defineProperty(target, property, attributes);
	if (!isProxyKey(property)) {
		options.onChanges?.({
			name: property,
			value: attributes.value as V,
			previousValue: previousValue,
			state: "defined",
		});
	}
	return true;
}

function deleteProperty<T extends object, P extends keyof T, V extends T[P]>(
	options: TProxyOptions<T>,
	target: T,
	property: P,
): boolean {
	const previousValue = target[property];

	delete target[property];
	delete target[getProxyKey(property) as P];

	if (!isProxyKey(property)) {
		options.onChanges?.({
			name: property,
			value: undefined as V,
			previousValue: previousValue,
			state: "deleted",
		});
	}
	return true;
}

/**
 * Cria um Proxy reativo sobre `targetObj`. Toda mudança de propriedade
 * dispara `onChanges`/`onSet` (globais ou por propriedade, via `options`).
 * Métodos são rebindados ao próprio proxy automaticamente, memorizados por
 * instância na primeira leitura. Propriedades-objeto ganham proxy aninhado
 * sob demanda (nunca antecipado) quando `allProxy` ou a config da
 * propriedade pedir — reatribuir a propriedade invalida o aninhado antigo
 * sozinho, sem precisar de `deleteProxy` manual antes (ele continua
 * disponível pra invalidação explícita, se algum dia fizer sentido).
 */
function proxyHandler<T extends object>(
	targetObj: T,
	options: TProxyOptions<T> = {},
): T {
	let proxy!: T;
	proxy = new Proxy(targetObj, {
		get: (target, property) => get(options, target as T, property as keyof T, proxy),
		set: (target, property, value) => set(options, target as T, property as keyof T, value),
		defineProperty: (target, property, attributes) => defineProperty(options, target as T, property as keyof T, attributes),
		deleteProperty: (target, property) => deleteProperty(options, target as T, property as keyof T),
	});
	return proxy;
}

/** Invalida o proxy aninhado cacheado de uma propriedade específica, se houver. */
function deleteProxy<T>(value: TObject<T>, key: keyof T): void {
	delete (value as any)[getProxyKey(key)];
}

export {
	proxyHandler,
	deleteProxy,
}
