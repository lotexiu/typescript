import { TFn } from '@tsn-function/types';

/** HTTP methods a `Service` supports. */
type TRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
/** Performs one request. */
type THttpFn = TFn<any, Promise<any>>;
/** When an interceptor runs. */
type TTriggerType = 'before' | 'after' | 'error';

/** Which requests an interceptor applies to. */
type TInterceptorOptions = {
	/** Default `before`. */
	when?: TTriggerType;
	/** Default: every method. */
	methods?: TRequestMethod[];
	/** URL patterns (`*` wildcard, `!` excludes). Default: every route. */
	routes?: string[];
};

/** @internal */
type TCompiledRoute = {
	include: RegExp[];
	exclude: RegExp[];
};

/** @internal */
type TCompiledInterceptor = {
	route: TCompiledRoute;
	handler: Function;
};

export {
	TRequestMethod,
	THttpFn,
	TTriggerType,
	TInterceptorOptions,
	TCompiledRoute,
	TCompiledInterceptor,
};
