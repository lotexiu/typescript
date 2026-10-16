import { TFn } from '@tsn-function/types';

type TRequestMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type THttpFn = TFn<any, Promise<any>>;
type TTriggerType = 'before' | 'after' | 'error';

type TInterceptorOptions = {
	when?: TTriggerType;
	methods?: TRequestMethod[];
	routes?: string[];
};

type TCompiledRoute = {
	include: RegExp[];
	exclude: RegExp[];
};

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
