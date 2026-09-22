type TProxyProp<T> = keyof T & (string | symbol);

interface TProxyHandler<T extends object> extends ProxyHandler<T> {
	deleteProperty?<Prop extends TProxyProp<T>>(target: T, property: Prop): boolean;
	get?<Prop extends TProxyProp<T>>(target: T, property: Prop, receiver: any): any;
	getOwnPropertyDescriptor?<Prop extends TProxyProp<T>>(
		target: T,
		property: Prop
	): PropertyDescriptor | undefined;
	has?<Prop extends TProxyProp<T>>(target: T, property: Prop): boolean;
	set?<Prop extends TProxyProp<T>>(
		target: T,
		property: Prop,
		newValue: T[Prop],
		receiver: any
	): boolean;
}

export { TProxyHandler, TProxyProp };
