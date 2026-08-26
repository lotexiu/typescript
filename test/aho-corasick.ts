import { readFileSync } from 'node:fs'
import { AhoCorasick } from '../src/aho-corasick/model'
import { AhoCorasick as OldAhoCorasick } from '../src/.old-aho-corasick/model'
import { _Regex } from '../src/natives/regex/implementations'

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
// Correctness — exemplo clássico do livro (Aho & Corasick, 1975)
// ---------------------------------------------------------------------------
section('correctness — classic "ushers" example')
{
	const ac = AhoCorasick.compile([
		{ id: 1, value: 'he' },
		{ id: 2, value: 'she' },
		{ id: 3, value: 'his' },
		{ id: 4, value: 'hers' },
	])
	const matches = ac.scan('ushers')
	check('finds all overlapping matches', matches, [
		{ patternId: 2, start: 1, end: 4 },
		{ patternId: 1, start: 2, end: 4 },
		{ patternId: 4, start: 2, end: 6 },
	])
}

// ---------------------------------------------------------------------------
// Correctness — hooks
// ---------------------------------------------------------------------------
section('correctness — hooks')
{
	const ac = AhoCorasick.compile([{ id: 1, value: 'he' }, { id: 2, value: 'she' }])

	const rejected = ac.scan('ushers', { onMatch: (patternId) => patternId !== 1 })
	check('onMatch rejects a patternId', rejected, [{ patternId: 2, start: 1, end: 4 }])

	const skipped = ac.scan('ushers', { onPosition: (i) => (i === 1 ? 2 : undefined) })
	check('onPosition skip breaks matches spanning the skip', skipped, [])
}

console.log(`\n${passed} passed, ${failed} failed`)

// ---------------------------------------------------------------------------
// Benchmark — Aho-Corasick vs. abordagens ingênuas baseadas em regex/indexOf
//
// Divergência esperada de contagem (não é bug):
//   - AC e "indexOf por padrão" contam TODAS as ocorrências, incluindo sobrepostas
//     (ex: "in" dentro de "instanceof") — mesma semântica, implementações diferentes.
//   - "regex alternation" avança o lastIndex após cada match (comportamento nativo do
//     RegExp global), então nunca reporta matches que começam dentro de um match anterior —
//     por isso tende a contar menos. É o approach que um lexer regex-based usaria na prática
//     (padrões ordenados do mais longo pro mais curto, pra simular maximal munch).
// ---------------------------------------------------------------------------
section('benchmark')

const BASE_SOURCE = 'src/natives/string/implementations.ts'
const baseText = readFileSync(BASE_SOURCE, 'utf-8')

function corpus(targetLength: number): string {
	let text = baseText
	while (text.length < targetLength) text += baseText
	return text.slice(0, targetLength)
}

const KEYWORDS_SMALL = ['function', 'const', 'let', 'class', 'return', 'if', 'else', 'for', 'import', 'export']
const KEYWORDS_MEDIUM = [
	...KEYWORDS_SMALL, 'interface', 'type', 'extends', 'implements', 'static', 'private', 'public',
	'readonly', 'new', 'this', 'super', 'void', 'null', 'undefined', 'true', 'false', 'switch', 'case',
	'break', 'continue', 'while', 'do', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof',
	'in', 'of', 'as', 'async', 'await', 'yield', 'delete', 'enum', 'namespace',
]
function keywordsLarge(n: number): string[] {
	const out = [...KEYWORDS_MEDIUM]
	let i = out.length
	while (out.length < n) out.push(`synthetic_pattern_${i++}`)
	return out
}

function buildAlternationRegex(patterns: string[]): RegExp {
	const sorted = [...patterns].sort((a, b) => b.length - a.length)
	return new RegExp(sorted.map((p) => _Regex.escapeReservedKeys(p)).join('|'), 'g')
}

function scanAlternation(text: string, regex: RegExp): number {
	regex.lastIndex = 0
	let count = 0
	let m: RegExpExecArray | null
	while ((m = regex.exec(text))) {
		count++
		if (m[0].length === 0) regex.lastIndex++
	}
	return count
}

function scanPerPatternRegex(text: string, patterns: string[]): number {
	let count = 0
	for (const p of patterns) {
		const re = new RegExp(_Regex.escapeReservedKeys(p), 'g')
		while (re.exec(text)) count++
	}
	return count
}

function scanPerPatternIndexOf(text: string, patterns: string[]): number {
	let count = 0
	for (const p of patterns) {
		let idx = text.indexOf(p)
		while (idx !== -1) {
			count++
			idx = text.indexOf(p, idx + 1)
		}
	}
	return count
}

function bench(label: string, iterations: number, fn: () => void) {
	for (let i = 0; i < Math.min(5, iterations); i++) fn()
	const start = performance.now()
	for (let i = 0; i < iterations; i++) fn()
	const ms = performance.now() - start
	console.log(`    ${label}: ${ms.toFixed(2)}ms total, ${(ms / iterations).toFixed(4)}ms/iter`)
}

const TEXT_SIZES: Record<string, number> = { small: 2_000, medium: 50_000, large: 500_000 }
const PATTERN_SETS: Record<string, string[]> = { small: KEYWORDS_SMALL, medium: KEYWORDS_MEDIUM, large: keywordsLarge(200) }
const ITERATIONS: Record<string, number> = { small: 300, medium: 60, large: 8 }

for (const [textLabel, textLen] of Object.entries(TEXT_SIZES)) {
	const text = corpus(textLen)
	for (const [patLabel, patterns] of Object.entries(PATTERN_SETS)) {
		console.log(`\n--- texto=${textLabel} (${text.length} chars) x padrões=${patLabel} (${patterns.length}) ---`)

		const acPatterns = patterns.map((value, id) => ({ id, value }))

		const compileStart = performance.now()
		const ac = AhoCorasick.compile(acPatterns)
		console.log(`    [AC novo/DFA] compile: ${(performance.now() - compileStart).toFixed(3)}ms`)

		const oldCompileStart = performance.now()
		const oldAc = OldAhoCorasick.compile(acPatterns)
		console.log(`    [AC velho/trie+fail] compile: ${(performance.now() - oldCompileStart).toFixed(3)}ms`)

		const regex = buildAlternationRegex(patterns)
		const acMatches = ac.scan(text).length
		const oldAcMatches = oldAc.scan(text).length
		const regexMatches = scanAlternation(text, regex)
		const indexOfMatches = scanPerPatternIndexOf(text, patterns)
		console.log(`    matches — AC novo: ${acMatches}, AC velho: ${oldAcMatches}, regex alternation: ${regexMatches}, indexOf por padrão: ${indexOfMatches}`)

		const iterations = ITERATIONS[textLabel]
		bench('AC novo (DFA flat)', iterations, () => ac.scan(text))
		bench('AC velho (trie+fail)', iterations, () => oldAc.scan(text))
		bench('regex alternation', iterations, () => scanAlternation(text, regex))
		bench('indexOf por padrão (N scans)', iterations, () => scanPerPatternIndexOf(text, patterns))
		if (!(patLabel === 'large' && textLabel === 'large')) {
			bench('regex por padrão (N scans)', iterations, () => scanPerPatternRegex(text, patterns))
		}
	}
}
