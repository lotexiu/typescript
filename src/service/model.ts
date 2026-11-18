import {
	TCompiledInterceptor,
	TCompiledRoute,
	THttpFn,
	TInterceptorOptions,
	TRequestMethod,
	TTriggerType,
} from './types';
import { SERVICE_REGEX } from './declarations';

function compileRoutes(patterns: string[]): TCompiledRoute {
	const include: RegExp[] = [];
	const exclude: RegExp[] = [];

	for (let i = 0, len = patterns.length; i < len; i++) {
		let pattern = patterns[i];
		let isNegated = false;

		if (pattern.startsWith('!')) {
			isNegated = true;
			pattern = pattern.slice(1);
		}

		const escaped = pattern.replace(SERVICE_REGEX.ROUTE_RESERVED_CHARACTERS, '\\$&');
		const regex = new RegExp('^' + escaped.replace(SERVICE_REGEX.ROUTE_WILDCARD, '.*') + '$');

		if (isNegated) {
			exclude.push(regex);
		} else {
			include.push(regex);
		}
	}

	return { include, exclude };
}

/**
 * Base of an HTTP service: protected `get`/`post`/`put`/`patch`/`delete` going through interceptors chosen by moment, method and route.
 */
abstract class Service {
	/** Functions that perform the requests (default `fetch`); replace them to change the transport. */
	static http: Record<TRequestMethod, THttpFn> = {
		get: (url, options) => fetch(url, { ...options, method: 'GET' }),
		post: (url, options) => fetch(url, { ...options, method: 'POST' }),
		put: (url, options) => fetch(url, { ...options, method: 'PUT' }),
		patch: (url, options) => fetch(url, { ...options, method: 'PATCH' }),
		delete: (url, options) => fetch(url, { ...options, method: 'DELETE' }),
	};

	#interceptors: Record<TTriggerType, Record<TRequestMethod, TCompiledInterceptor[]>> = {
		before: { delete: [], get: [], patch: [], post: [], put: [] },
		after: { delete: [], get: [], patch: [], post: [], put: [] },
		error: { delete: [], get: [], patch: [], post: [], put: [] },
	};

	async #executeInterceptors(
		list: TCompiledInterceptor[],
		url: string,
		dataOrOptions: any
	): Promise<any> {
		let currentData = dataOrOptions;

		for (let i = 0, len = list.length; i < len; i++) {
			const { route, handler } = list[i];
			let isExcluded = false;
			for (let excludeIndex = 0, excludeCount = route.exclude.length; excludeIndex < excludeCount; excludeIndex++) {
				if (route.exclude[excludeIndex].test(url)) {
					isExcluded = true;
					break;
				}
			}
			if (isExcluded) continue;
			let matches = route.include.length === 0;
			if (!matches) {
				for (let inc = 0, incLen = route.include.length; inc < incLen; inc++) {
					if (route.include[inc].test(url)) {
						matches = true;
						break;
					}
				}
			}
			if (matches) {
				const result = await handler(currentData, url);
				if (result !== undefined) {
					currentData = result;
				}
			}
		}

		return currentData;
	}

	async #request<T>(method: TRequestMethod, url: string, options?: any): Promise<T> {
		let currentUrl = url;
		let currentOptions = options;

		try {
			const beforeList = this.#interceptors.before[method];
			if (beforeList.length > 0) {
				const context = { url: currentUrl, options: currentOptions };
				const modified = await this.#executeInterceptors(beforeList, currentUrl, context);
				if (modified && typeof modified === 'object') {
					currentUrl = modified.url ?? currentUrl;
					currentOptions = modified.options ?? currentOptions;
				}
			}
			let response = await Service.http[method](currentUrl, currentOptions);
			const afterList = this.#interceptors.after[method];
			if (afterList.length > 0) {
				response = await this.#executeInterceptors(afterList, currentUrl, response);
			}
			return response;
		} catch (error) {
			let currentError = error;
			const errorList = this.#interceptors.error[method];
			if (errorList.length > 0) {
				currentError = await this.#executeInterceptors(errorList, currentUrl, currentError);
			}
			throw currentError;
		}
	}

	protected get<T>(url: string, options?: any): Promise<T> {
		return this.#request<T>('get', url, options);
	}
	protected post<T>(url: string, options?: any): Promise<T> {
		return this.#request<T>('post', url, options);
	}
	protected put<T>(url: string, options?: any): Promise<T> {
		return this.#request<T>('put', url, options);
	}
	protected patch<T>(url: string, options?: any): Promise<T> {
		return this.#request<T>('patch', url, options);
	}
	protected delete<T>(url: string, options?: any): Promise<T> {
		return this.#request<T>('delete', url, options);
	}

	/**
	 * Registers a handler run `before`, `after` or on `error` of the matching requests. Returns the function that removes it.
	 */
	interceptor(handler: Function, options?: TInterceptorOptions) {
		const when = options?.when || 'before';
		const methods = options?.methods || ['delete', 'get', 'patch', 'post', 'put'];
		const route = compileRoutes(options?.routes || []);

		const compiled: TCompiledInterceptor = {
			route,
			handler,
		};

		for (let i = 0, len = methods.length; i < len; i++) {
			this.#interceptors[when][methods[i]].push(compiled);
		}

		return () => {
			for (let i = 0, len = methods.length; i < len; i++) {
				this.#interceptors[when][methods[i]] = this.#interceptors[when][methods[i]].filter(
					(interceptor) => interceptor !== compiled
				);
			}
		};
	}
}

export { Service };
