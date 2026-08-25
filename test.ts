import './src/index';
import { Mask } from './src/index';
import { StringUtils } from './src/natives/string/utils';

let passed = 0
let failed = 0

function check(name: string, actual: unknown, expected: unknown) {
	const a = JSON.stringify(actual)
	const e = JSON.stringify(expected)
	if (a === e) {
		passed++
		console.log(`  ✓ ${name}`)
	} else {
		failed++
		console.log(`  ✗ ${name} — expected ${e}, got ${a}`)
	}
}

function section(title: string) {
	console.log(`\n${title}`)
}

// ---------------------------------------------------------------------------
// Typing simulation — a user filling a CPF-like field one keystroke at a time.
// ---------------------------------------------------------------------------
section('typing simulation (CPF mask 0{3}.0{3}.0{3}-0{2})')
{
	const cpfMask = '0{3}.0{3}.0{3}-0{2}'
	const digits = '11144477735'
	let typed = ''
	const progression: string[] = []
	for (const digit of digits) {
		typed += digit
		progression.push(Mask.apply(typed, cpfMask))
	}
	console.log('  ' + progression.join(' -> '))
	check('final formatted value', progression.at(-1), '111.444.777-35')
	check('separator withheld until next group starts', progression[3], '111.4')
	check('separator not shown with nothing typed yet', Mask.apply('', cpfMask), '')
}

// ---------------------------------------------------------------------------
// Backspacing — deleting from the formatted display and re-deriving raw input.
// ---------------------------------------------------------------------------
section('backspace simulation')
{
	const cpfMask = '0{3}.0{3}.0{3}-0{2}'
	let display = Mask.apply('11144477735', cpfMask)
	const steps: string[] = [display]
	while (display.length) {
		display = display.slice(0, -1)
		display = Mask.apply(Mask.unapply(display, cpfMask), cpfMask)
		steps.push(display)
	}
	console.log('  ' + steps.join(' -> '))
	check('backspacing all the way empties the field', steps.at(-1), '')
	check('backspacing past a separator drops the digit before it', steps[2], '111.444.777')
}

// ---------------------------------------------------------------------------
// Pasting a fully-formatted (or garbage-laden) value — extracting raw digits.
// ---------------------------------------------------------------------------
section('unapply — pasted/garbage input')
{
	const cpfMask = '0{3}.0{3}.0{3}-0{2}'
	check('paste already-formatted value', Mask.unapply('111.444.777-35', cpfMask), '11144477735')
	check('paste with stray letters mixed in', Mask.unapply('111a444b777c35', cpfMask), '11144477735')
	check('re-apply after paste round-trips', Mask.apply(Mask.unapply('111.444.777-35', cpfMask), cpfMask), '111.444.777-35')
}

// ---------------------------------------------------------------------------
// valid()
// ---------------------------------------------------------------------------
section('valid()')
{
	const cpfMask = '0{3}.0{3}.0{3}-0{2}'
	check('valid: complete, correctly formatted', Mask.valid('111.444.777-35', cpfMask), true)
	check('valid: complete, raw (no literals)', Mask.valid('11144477735', cpfMask), false)
	check('invalid: still mid-typing', Mask.valid('111.444.777', cpfMask), false)
	check('invalid: right digits, wrong literals', Mask.valid('111-444-777-35', cpfMask), false)
	check('invalid: one digit short', Mask.valid('111.444.777-3', cpfMask), false)
}

// ---------------------------------------------------------------------------
// Quantifiers: *, ?, {n}, {n,}, {n,m}
// ---------------------------------------------------------------------------
section('quantifiers')
{
	check('star (*) matches zero', Mask.apply('', '0*-A'), '')
	check('star (*) is greedy/open-ended', Mask.apply('123456789a', '0*-A'), '123456789')
	check('question (?) present', Mask.apply('1a', '0?-A'), '1-a')
	check('exact range {2,}', Mask.unapply('123456', '0{2,}'), '123456')

	// Known limitation, not asserted pass/fail: unapply() has no lookahead — a char that fails
	// the *current* rule is always treated as noise to skip, even when that rule is optional
	// (min 0) and the char would actually satisfy the *next* rule. So an optional rule sitting
	// in front of a required one can strand input meant for the required one.
	const stranded = Mask.apply('a', '0?-A')
	console.log(`  ⚠ optional-rule lookahead gap: apply('a', '0?-A') => ${JSON.stringify(stranded)} (arguably "-a" or "a", not "")`)
}

// ---------------------------------------------------------------------------
// Alternation (||) — picks whichever branch matches best.
// ---------------------------------------------------------------------------
section('alternation (||)')
{
	check('digits branch selected', Mask.apply('123', '0{3}||A{3}'), '123')
	check('letters branch selected', Mask.apply('abc', '0{3}||A{3}'), 'abc')
}

// ---------------------------------------------------------------------------
// Unicode-aware rules (letters/currency/symbols need the "v" flag to work at all —
// see CLAUDE.md's note on \p{...} silently no-op'ing without u/v).
// ---------------------------------------------------------------------------
section('unicode-aware rules')
{
	check('U matches accented uppercase', Mask.apply('É', 'U'), 'É')
	check('L matches accented lowercase', Mask.apply('é', 'L'), 'é')
	check('W matches any letter incl. cedilla', Mask.apply('ç', 'W'), 'ç')
	check('C matches currency symbol', Mask.apply('$', 'C'), '$')
}

// ---------------------------------------------------------------------------
// Regression: astral characters (emoji) — apply() used to slice by UTF-16 code
// unit while unapply() counts by code point, silently dropping half a surrogate
// pair's worth of emoji. Fixed by indexing apply() off [...raw] instead of raw.slice.
// ---------------------------------------------------------------------------
section('regression — astral characters (emoji) stay intact through apply()')
{
	const twoEmoji = '\u{1F600}\u{1F600}' // 😀😀 — 4 UTF-16 code units, 2 code points
	check('unapply keeps both emoji', Mask.unapply(twoEmoji, 'E{2}'), twoEmoji)
	check('apply keeps both emoji (was dropping the 2nd)', Mask.apply(twoEmoji, 'E{2}'), twoEmoji)
	check('apply across two emoji groups', Mask.apply(twoEmoji + twoEmoji, 'E{2}-E{2}'), `${twoEmoji}-${twoEmoji}`)
}

// ---------------------------------------------------------------------------
// Regression: trailing literal after the last rule token used to be dropped
// unconditionally (e.g. a mask suffix like "%").
// ---------------------------------------------------------------------------
section('regression — trailing mask literal is no longer dropped')
{
	check('suffix after a fully-typed segment', Mask.apply('12', '0{2}%'), '12%')
	check('suffix after a fully-typed multi-segment mask', Mask.apply('1234', '0{2}-0{2}%'), '12-34%')
	// Matches the same rule the typing simulation above relies on ("111.4" shows the separator
	// after only 1 of 3 digits in the next group): a literal appears once its preceding rule
	// token has received *any* input, not only once that token hits its full quantifier.
	check('suffix appears once its preceding segment has any input', Mask.apply('1', '0{2}%'), '1%')
	check('suffix withheld with no input at all', Mask.apply('', '0{2}%'), '')
}

// ---------------------------------------------------------------------------
// Regression: valid() used to index `value[index]` directly, splitting a
// surrogate pair in half and handing token.test a lone unpaired surrogate.
// ---------------------------------------------------------------------------
section('regression — valid() handles astral characters (emoji)')
{
	check('two emoji, exact match', Mask.valid('🐒🐒', 'E{2}'), true)
	check('one emoji short still invalid', Mask.valid('🐒', 'E{2}'), false)
	check('emoji + literal suffix', Mask.valid('🐒%', 'E%'), true)
}
// throw ''

// ---------------------------------------------------------------------------
// Regression: forEach() called the callback twice for non-astral strings
// (fast path fell through into the segmenter loop instead of returning), and
// neither forEach() nor onChar() exposed the matched grapheme's code-unit size.
// ---------------------------------------------------------------------------
section('regression — StringUtils.forEach()/onChar() astral + double-invocation')
{
	let calls = 0
	StringUtils.forEach('abc', () => { calls++ })
	check('forEach visits a plain string exactly once per char (no double-call)', calls, 3)

	const sizes: number[] = []
	StringUtils.forEach('a\u{1F600}b', (_char, _index, size) => { sizes.push(size) })
	check('forEach reports code-unit size per grapheme (1, 2, 1)', sizes, [1, 2, 1])

	const scanVowels = StringUtils.onChar('aeiou')
	const hits: number[] = []
	scanVowels('banana', (index) => { hits.push(index) })
	check('onChar finds all matches in a plain string', hits, [1, 3, 5])

	const scanEmoji = StringUtils.onChar('\u{1F600}')
	const emojiHits: Array<[number, number]> = []
	scanEmoji('a\u{1F600}b\u{1F600}', (index, size) => { emojiHits.push([index, size]) })
	check('onChar matches an astral target via the Set fallback', emojiHits, [[1, 2], [4, 2]])
}

// ---------------------------------------------------------------------------
// Regression: capitalize() used charAt(0), which only grabs the high
// surrogate half of an astral first character.
// ---------------------------------------------------------------------------
section('regression — capitalize() is astral-safe')
{
	check('plain ascii still capitalizes', StringUtils.capitalize('hello'), 'Hello')
	check('astral first char is not corrupted', StringUtils.capitalize('\u{1F600}bc'), '\u{1F600}bc')
}

// ---------------------------------------------------------------------------
// Regression: setRule() used to only invalidate the compile cache if a
// separate, easy-to-forget Mask.init() had been called first.
// ---------------------------------------------------------------------------
section('regression — setRule() invalidates the cache without a manual init()')
{
	Mask.setRule('9', { match: ['[1-9]'] }) // custom rule: nonzero digit
	check('custom rule works right after setRule', Mask.apply('0123456789', '9*'), '123456789')
	Mask.setRule('9', { match: ['[a-z]'] }) // redefine the same key to something else
	check('redefining a key is not served from a stale cache', Mask.apply('0123456789', '9*'), '')
	check('redefined rule matches its new pattern', Mask.apply('abc123', '9*'), 'abc')
}

console.log(`\n${passed} passed, ${failed} failed`)

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------
section('performance')
{
	const mask = '0{3}.0{3}.0{3}-0{2}'
	const formatted = '111.444.777-35'
	const raw = '11144477735'

	const t0 = performance.now()
	Mask.apply(raw, mask) // first time this mask string is compiled (cold)
	const coldMs = performance.now() - t0

	const N = 200_000
	const bench = (label: string, fn: () => void) => {
		const start = performance.now()
		for (let i = 0; i < N; i++) fn()
		const ms = performance.now() - start
		console.log(`  ${label}: ${ms.toFixed(1)}ms for ${N} calls (${(ms * 1000 / N).toFixed(3)}µs/op, ${(N / (ms / 1000) / 1e6).toFixed(2)}M ops/s)`)
	}

	console.log(`  cold compile+apply (first call for a new mask): ${coldMs.toFixed(3)}ms`)
	bench('apply  (warm cache)', () => Mask.apply(raw, mask))
	bench('unapply(warm cache)', () => Mask.unapply(formatted, mask))
	bench('valid  (warm cache)', () => Mask.valid(formatted, mask))
}
