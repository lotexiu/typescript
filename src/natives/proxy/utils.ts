import { TProxyHandler } from './types';

class ProxyUtils {
	static proxy<T extends object>(value: T, handler: TProxyHandler<T>) {
		return new Proxy(value, handler);
	}
}

const { proxy } = ProxyUtils;

export { ProxyUtils, proxy };
