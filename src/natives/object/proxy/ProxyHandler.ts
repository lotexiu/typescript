import '@ts/global';
import type { ProxyOptions } from "./types";
import { TObject } from '@tsn-object/generic/types';

function set<T extends object, P extends keyof T, V extends T[P]>(
	options: ProxyOptions<T>,
	target: T,
	property: P,
	value: V,
	receiver: any
): boolean {

	const previousValue = target[property];
	if (previousValue === value) return true;

	if (value) {
		switch (typeof value) {
			case 'object':
				if (options.properties && isProxyEnabled<T, P>(options, property)) {
					createProxyProperty(target, property, options.properties?.[property]?.options);
				}
			break;
		}
	}

	target[property] = value;
	options.properties?.[property]?.onSet?.(value);
	options.onChanges?.({
		name: property,
		value: value,
		previousValue: previousValue,
		state: 'updated'
	})
	return true
}

function get<T extends object, P extends keyof T, V extends T[P]>(
	options: ProxyOptions<T>,
	target: T,
	property: P
): V {
	let value: V = target[property] as V;
	if (value) {
		const descriptor = Object.getOwnPropertyDescriptor(target, property);
		const isConfigurable = (!descriptor || descriptor.configurable !== false);

		switch (typeof value) {
			case 'function':
				if (isConfigurable && !value.fn) value = (value as any).rebind(target);
				break;
			case 'object':
				if (isConfigurable && isProxyEnabled<T, P>(options, property)) {
					value = createProxyProperty(target, property, options.properties?.[property]?.options) as V;
				}
				break;
		}
	}

	const returnedValue = options.properties?.[property]?.onGet?.(value);
	if (returnedValue !== undefined) return returnedValue;
	return value
}

function isProxyEnabled<T extends object, P extends keyof T>(options: ProxyOptions<T>, property: P) {
	const isProxyKey = property.toString().startsWith('__') && property.toString().endsWith('Proxy');
	if (isProxyKey) return false;
	return (options.allProxy || options.properties?.[property]?.proxyVariable || options.properties?.[property]?.onChanges);
}

function deleteProperty<T, P extends keyof T, V extends T[P]>(
	options: ProxyOptions<T>,
	target: T,
	property: P
): boolean {
	const previousValue = target[property];

	delete target[property];
	delete target[getProxyKey(property) as P];

	options.onChanges?.({
		name: property,
		value: undefined as V,
		previousValue: previousValue,
		state: 'deleted'
	})
	return true
}

function createProxyProperty<
	T extends object,
	P extends keyof T,
	V extends T[P]
> (target:T, property: P, options?: ProxyOptions<V>): V {
	const proxyProperty = getProxyKey(property) as P;
	if (target[property] && !target[proxyProperty] && typeof target[property] === 'object') {
		target[proxyProperty] = proxyHandler(target[property], options as any);
	}
	return target[proxyProperty] as V;
}

function getProxyKey<T extends (string|number|symbol)>(property: T): `__${T&string}Proxy` {
	return `__${property.toString()}Proxy` as any
}

function proxyHandler<T extends object>(
	targetObj: T,
	options: ProxyOptions<T> = {}
): T {
	const proxy = new Proxy(targetObj,{
		set: (set as any).bind(null, options),
		get: (get as any).bind(null, options),
		deleteProperty: (deleteProperty as any).bind(null, options),
	});
	return proxy
}

function deleteProxy<T>(value: TObject<T>, key: keyof T): void {
	delete value[getProxyKey(key) as keyof T];
}

export {
	proxyHandler,
	deleteProxy,
}

export type {
	ProxyOptions,
}
