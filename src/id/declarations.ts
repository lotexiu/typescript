/** @internal */
const UUID_BYTES = 16;
/** @internal */
const UUID_V4_VERSION = 0x40;
/** @internal */
const UUID_VARIANT = 0x80;
/** @internal Alfabeto seguro para URL (64 símbolos): sem ambiguidade de codificação. Acesse por `IdUtils.urlAlphabet`. */
const URL_ALPHABET = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
/** @internal */
const DEFAULT_SHORT_SIZE = 21;
/** @internal */
const MAX_ALPHABET = 256;

/** @internal Byte → 2 dígitos hexadecimais (tabela pronta, sem `toString(16)` por byte). */
const HEX_TABLE = Array.from({ length: 256 }, (_, byte) => byte.toString(16).padStart(2, '0'));

export { HEX_TABLE, UUID_BYTES, UUID_V4_VERSION, UUID_VARIANT, URL_ALPHABET, DEFAULT_SHORT_SIZE, MAX_ALPHABET };
