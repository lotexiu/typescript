import { TProxyHandler } from './types';

/** Typed wrapper around `Proxy`. */
class ProxyUtils {
	/** A `Proxy` of `value` with traps typed by its keys. */
	static proxy<T extends object>(value: T, handler: TProxyHandler<T>) {
		return new Proxy(value, handler);
	}
}

/** Shortcut for `ProxyUtils.proxy`. */
const { proxy } = ProxyUtils;

export { ProxyUtils, proxy };
