import { NumberPlugin } from "../number/model";
import { TNumberPluginOptions } from "../number/types";
import { DatePlugin } from "../date/model";
import { TDatePluginOptions } from "../date/types";

/**
 * Registro `tipo -> factory` pros plugins de tipo (mutuamente exclusivos por
 * campo — um input genérico usa isso pra resolver qual instanciar a partir
 * de uma config declarada, ex.: `{ type: 'number' }`). Não é um "gerenciador
 * de plugins" genérico: plugins modificadores (mask, validação) nunca entram
 * aqui, continuam sempre livres, compostos por quem consome.
 */
const TYPE_PLUGIN_FACTORY = {
	number: (options?: TNumberPluginOptions) => new NumberPlugin(options),
	date: (options?: TDatePluginOptions) => new DatePlugin(options),
};

type TTypePluginFactory = typeof TYPE_PLUGIN_FACTORY;
/** The declared `type` names `createTypePlugin` can resolve (currently `"number"` and `"date"`). */
type TTypePluginName = keyof TTypePluginFactory;

/** Resolve e instancia o plugin de tipo certo a partir do nome declarado. */
function createTypePlugin<T extends TTypePluginName>(
	type: T,
	options?: Parameters<TTypePluginFactory[T]>[0],
): ReturnType<TTypePluginFactory[T]> {
	return TYPE_PLUGIN_FACTORY[type](options as any) as any;
}

export {
	createTypePlugin,
	TYPE_PLUGIN_FACTORY,
}

export type {
	TTypePluginName,
}
