/** A custom raw-text-to-`Date` parser, for `DatePlugin` options — swap in when the default strict ISO parsing isn't the right format. */
type TDateParseFn = (raw: string) => Date | undefined;

/** Constructor/`setParse` options for `DatePlugin`. */
interface TDatePluginOptions {
	/** Parser customizado. Padrão: ISO estrito (yyyy-mm-dd). Passe o seu pra outros formatos — não tentamos adivinhar formato universal. */
	parse?: TDateParseFn;
}

export type {
	TDateParseFn,
	TDatePluginOptions,
}
