/** @internal */
const DECIMAL_RADIX = 10n;
/** @internal Limite do expoente aceito em `1e999`, para não alocar números gigantes por engano. */
const MAX_EXPONENT = 1000;
/** @internal */
const DECIMAL_TEXT = /^([+-])?(?:(\d+)(?:\.(\d+))?|\.(\d+))(?:[eE]([+-]?\d+))?$/;

export { DECIMAL_RADIX, MAX_EXPONENT, DECIMAL_TEXT };
