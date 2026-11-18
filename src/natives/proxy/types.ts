/** A property key of `T`. */
type TProxyProp<T> = keyof T & (string | symbol);

/** `ProxyHandler` with traps typed by the target's own keys. */
interface TProxyHandler<T extends object> extends ProxyHandler<T> {
	/** Trap for `delete target[property]`. */
	deleteProperty?<Prop extends TProxyProp<T>>(target: T, property: Prop): boolean;
	/** Trap for reads. */
	get?<Prop extends TProxyProp<T>>(target: T, property: Prop, receiver: any): any;
	/** Trap for `Object.getOwnPropertyDescriptor`. */
	getOwnPropertyDescriptor?<Prop extends TProxyProp<T>>(
		target: T,
		property: Prop
	): PropertyDescriptor | undefined;
	/** Trap for `property in target`. */
	has?<Prop extends TProxyProp<T>>(target: T, property: Prop): boolean;
	/** Trap for writes. */
	set?<Prop extends TProxyProp<T>>(
		target: T,
		property: Prop,
		newValue: T[Prop],
		receiver: any
	): boolean;
}

export { TProxyHandler, TProxyProp };
