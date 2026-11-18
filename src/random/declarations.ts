/** @internal */
const UINT32_RANGE = 4294967296;
/** @internal */
const SPLITMIX_INCREMENT = 0x9e3779b9;
/** @internal */
const SPLITMIX_MUL_A = 0x21f0aaad;
/** @internal */
const SPLITMIX_MUL_B = 0x735a2d97;
/** @internal */
const FNV_OFFSET = 0x811c9dc5;
/** @internal */
const FNV_PRIME = 0x01000193;
/** @internal */
const STATE_WORDS = 4;
/** @internal */
const BYTES_PER_WORD = 4;

export { UINT32_RANGE, SPLITMIX_INCREMENT, SPLITMIX_MUL_A, SPLITMIX_MUL_B, FNV_OFFSET, FNV_PRIME, STATE_WORDS, BYTES_PER_WORD };
