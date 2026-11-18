/**
 * @internal
 * Char codes `0..127` get a slot in the lookup table; anything `>= ASCII_ALPHABET_SIZE`
 * is treated as "no pattern uses this char" and resets the automaton to the root.
 */
const ASCII_ALPHABET_SIZE = 128

export {
	ASCII_ALPHABET_SIZE,
}
