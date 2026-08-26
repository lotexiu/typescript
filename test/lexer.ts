import { readFileSync } from 'node:fs'
import * as ts from 'typescript'
import { Lexer } from '../src/lexer/model'
import { Parser } from '../src/parser/model'
import { ParserGate } from '../src/parser/node/model'

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

function isDigit(c: number) { return c >= 48 && c <= 57 }
function isLetter(c: number) { return (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || c === 95 }
function isIdentContinue(c: number) { return isDigit(c) || isLetter(c) }
function isSpace(c: number) { return c === 32 || c === 9 || c === 10 || c === 13 }

const KEYWORDS = [
	'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'interface',
	'type', 'import', 'export', 'extends', 'implements', 'new', 'this', 'super', 'void', 'null',
	'undefined', 'true', 'false', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally',
	'throw', 'typeof', 'instanceof', 'in', 'of', 'as', 'async', 'await', 'static', 'private', 'public',
	'readonly', 'enum', 'namespace', 'do', 'delete', 'yield',
]

const OPERATORS = [
	'{', '}', '(', ')', '[', ']', ';', ',', '.', ':', '?', '!',
	'=', '==', '===', '!=', '!==', '<', '>', '<=', '>=',
	'+', '-', '*', '/', '%', '&&', '||', '??', '=>', '...', '+=', '-=', '*=', '/=',
]

function makeLexer() {
	const lexer = new Lexer()
	lexer.escape = '\\'
	lexer.addRules(
		{ kind: 'keyword', type: 'literal', values: KEYWORDS },
		{ kind: 'operator', type: 'literal', values: OPERATORS },
		{ kind: 'identifier', type: 'charClass', test: isLetter, continueTest: isIdentContinue },
		{ kind: 'number', type: 'charClass', test: isDigit },
		{ kind: 'whitespace', type: 'charClass', test: isSpace },
		{ kind: 'string', type: 'delimited', open: '"', close: '"' },
		{ kind: 'string', type: 'delimited', open: "'", close: "'" },
		{ kind: 'comment', type: 'delimited', open: '/*', close: '*/' },
		{ kind: 'comment', type: 'delimited', open: '//', close: '\n', consumeClose: false },
	)
	return lexer
}

// ---------------------------------------------------------------------------
// Correctness
// ---------------------------------------------------------------------------
section('correctness — maximal munch entre operadores de tamanhos diferentes')
{
	const lexer = makeLexer()
	lexer.text.set('a === b')
	const kinds = lexer.tokens.map((t) => t.value)
	check('=== não vira "=" + "==" nem "==" + "="', kinds, ['a', ' ', '===', ' ', 'b'])
}

section('correctness — keyword vence identifier no empate')
{
	const lexer = makeLexer()
	lexer.text.set('const x = 1')
	check('primeiro token é keyword, não identifier', lexer.tokens[0].kind, 'keyword')
}

section('correctness — identificador começa em letra, continua em letra-ou-dígito')
{
	const lexer = makeLexer()
	lexer.text.set('x1 1x')
	const tokens = lexer.tokens.map((t) => ({ kind: t.kind, value: t.value }))
	check('x1 inteiro vira 1 identifier', tokens[0], { kind: 'identifier', value: 'x1' })
	check('1x separa em number("1") + identifier("x")', [tokens[2], tokens[3]], [
		{ kind: 'number', value: '1' },
		{ kind: 'identifier', value: 'x' },
	])
}

section('correctness — string com aspas escapadas não fecha cedo')
{
	const lexer = makeLexer()
	lexer.text.set('return "say \\"hi\\""')
	const strings = lexer.tokens.filter((t) => t.kind === 'string')
	check('1 única string', strings.length, 1)
	check('cobre até a aspas real final', strings[0].value, '"say \\"hi\\""')
}

section('correctness — comentário esconde o conteúdo de outras regras')
{
	const lexer = makeLexer()
	lexer.text.set('/* function return */ const')
	check('sequência de kinds', lexer.tokens.map((t) => t.kind), ['comment', 'whitespace', 'keyword'])
}

section('correctness — reatividade (mudar o texto recomputa tokens)')
{
	const lexer = makeLexer()
	lexer.text.set('const')
	const first = lexer.tokens[0]
	lexer.text.set('return')
	const second = lexer.tokens[0]
	check('kind muda junto com o texto', [first.kind, second.kind], ['keyword', 'keyword'])
	check('valor muda junto com o texto', [first.value, second.value], ['const', 'return'])
}

console.log(`\n${passed} passed, ${failed} failed`)

// ---------------------------------------------------------------------------
// Correção contra um oráculo real — compara fronteira de token a token contra
// o scanner oficial do TypeScript (`ts.createScanner`, já devDependency do
// pacote) rodando sobre um arquivo real e grande (Angular component, ~190KB).
// Não esperamos bater 100% (não temos regex literal, decorator como token
// próprio, número com expoente/hex/separador, template literal com `${}`
// aninhado etc.) — o valor aqui é achar ONDE a primeira divergência acontece
// e quanto do arquivo bate perfeitamente até lá.
// ---------------------------------------------------------------------------
section('correção — comparado ao ts.createScanner sobre um arquivo real')
{
	const REAL_FILE = 'test/test.txt'
	const text = readFileSync(REAL_FILE, 'utf-8')

	const KEYWORDS_TS = [
		'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum',
		'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null',
		'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with',
		'as', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield',
		'any', 'boolean', 'constructor', 'declare', 'get', 'module', 'require', 'number', 'set', 'string', 'symbol',
		'type', 'from', 'of', 'namespace', 'async', 'await', 'is', 'keyof', 'readonly', 'unique', 'infer', 'asserts',
		'never', 'object', 'global', 'bigint', 'override', 'satisfies', 'abstract', 'undefined', 'unknown', 'accessor',
	]

	const OPERATORS_TS = [
		'{', '}', '(', ')', '[', ']', ';', ',', '<', '>', '<=', '>=', '==', '!=', '===', '!==',
		'+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&', '|', '^', '!', '~', '&&', '||', '??',
		'?', ':', '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '|=', '^=', '&&=', '||=', '??=',
		'=>', '...', '.', '?.', '@',
	]

	function isDigit(c: number) { return c >= 48 && c <= 57 }
	function isIdentStart(c: number) { return (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || c === 95 || c === 36 }
	function isIdentContinue(c: number) { return isDigit(c) || isIdentStart(c) }
	function isNumberContinue(c: number) { return isDigit(c) || c === 46 }

	const lexer = makeLexer() // reaproveita as regras base — só troca keyword/operator pela lista mais completa
	lexer.clearRules()
	lexer.escape = '\\'
	lexer.addRules(
		{ kind: 'keyword', type: 'literal', values: KEYWORDS_TS },
		{ kind: 'operator', type: 'literal', values: OPERATORS_TS },
		{ kind: 'identifier', type: 'charClass', test: isIdentStart, continueTest: isIdentContinue },
		{ kind: 'number', type: 'charClass', test: isDigit, continueTest: isNumberContinue },
		{ kind: 'whitespace', type: 'charClass', test: isSpace },
		{ kind: 'string', type: 'delimited', open: '"', close: '"' },
		{ kind: 'string', type: 'delimited', open: "'", close: "'" },
		{ kind: 'template', type: 'delimited', open: '`', close: '`' },
		{ kind: 'comment', type: 'delimited', open: '/*', close: '*/' },
		{ kind: 'comment', type: 'delimited', open: '//', close: '\n', consumeClose: false },
	)
	lexer.text.set(text)
	const ourTokens = lexer.tokens

	const scanner = ts.createScanner(ts.ScriptTarget.Latest, false)
	scanner.setText(text)
	const tsTokens: { kind: string, start: number, end: number }[] = []
	while (true) {
		const kind = scanner.scan()
		if (kind === ts.SyntaxKind.EndOfFileToken) break
		tsTokens.push({ kind: ts.SyntaxKind[kind], start: scanner.getTokenStart(), end: scanner.getTextPos() })
	}

	console.log(`  nosso lexer: ${ourTokens.length} tokens (unknown: ${ourTokens.filter((t) => t.kind === 'unknown').length})`)
	console.log(`  ts scanner:  ${tsTokens.length} tokens`)

	// Trivia (whitespace/newline) tem granularidade diferente entre os dois (nosso `whitespace`
	// agrupa greedy, o scanner do TS separa 1 token por `\n`) — isso não é uma divergência real de
	// tokenização, é só forma de contar trivia. Filtra dos dois lados pra achar a primeira
	// divergência que importa de verdade (keyword/operator/identifier/literal/string/comment).
	const ourMeaningful = ourTokens.filter((t) => t.kind !== 'whitespace')
	const tsMeaningful = tsTokens.filter((t) => t.kind !== 'WhitespaceTrivia' && t.kind !== 'NewLineTrivia')

	let i = 0, j = 0
	let firstDivergence = -1
	while (i < ourMeaningful.length && j < tsMeaningful.length) {
		if (ourMeaningful[i].start !== tsMeaningful[j].start || ourMeaningful[i].end !== tsMeaningful[j].end) {
			firstDivergence = ourMeaningful[i].start
			break
		}
		i++; j++
	}

	if (firstDivergence === -1) {
		console.log('  nenhuma divergência de fronteira (ignorando granularidade de trivia) — bate 100%')
	} else {
		const line = text.slice(0, firstDivergence).split('\n').length
		console.log(`  primeira divergência (ignorando trivia) na posição ${firstDivergence} (linha ~${line})`)
		console.log(`  contexto: ${JSON.stringify(text.slice(Math.max(0, firstDivergence - 30), firstDivergence + 30))}`)
		console.log('  nossos tokens ao redor:')
		for (let k = Math.max(0, i - 2); k < Math.min(ourMeaningful.length, i + 4); k++) {
			const t = ourMeaningful[k]
			console.log(`    [${k}] ${t.kind.padEnd(12)} ${JSON.stringify(t.value)} (${t.start}-${t.end})`)
		}
		console.log('  ts scanner ao redor:')
		for (let k = Math.max(0, j - 2); k < Math.min(tsMeaningful.length, j + 4); k++) {
			const t = tsMeaningful[k]
			console.log(`    [${k}] ${t.kind.padEnd(24)} (${t.start}-${t.end}) ${JSON.stringify(text.slice(t.start, t.end))}`)
		}
	}

	const coveredUpTo = firstDivergence === -1 ? text.length : firstDivergence
	console.log(`  cobertura sem divergência (ignorando trivia): ${coveredUpTo} / ${text.length} chars (${(coveredUpTo / text.length * 100).toFixed(1)}%)`)
}

// ---------------------------------------------------------------------------
// Benchmark
// ---------------------------------------------------------------------------
section('benchmark')

const SOURCE_PATH = 'src/natives/string/implementations.ts'
const baseText = readFileSync(SOURCE_PATH, 'utf-8')

function corpus(targetLength: number): string {
	let text = baseText
	while (text.length < targetLength) text += baseText
	return text.slice(0, targetLength)
}

function makeParserOnly() {
	const parser = new Parser()
	parser.trackGaps = true
	parser.escape = '\\'
	parser.addGates(
		new ParserGate('"', '"', true),
		new ParserGate("'", "'", true),
		new ParserGate('/*', '*/', true),
		new ParserGate('//', '\n', true, false),
	)
	return parser
}

function bench(label: string, iterations: number, fn: () => void) {
	for (let i = 0; i < Math.min(5, iterations); i++) fn()
	const start = performance.now()
	for (let i = 0; i < iterations; i++) fn()
	const ms = performance.now() - start
	console.log(`    ${label}: ${ms.toFixed(2)}ms total, ${(ms / iterations).toFixed(4)}ms/iter`)
}

const TEXT_SIZES: Record<string, number> = { real_file: baseText.length, medium: 50_000, large: 500_000 }
const ITERATIONS: Record<string, number> = { real_file: 500, medium: 100, large: 15 }

for (const [label, targetLength] of Object.entries(TEXT_SIZES)) {
	const text = corpus(targetLength)
	console.log(`\n--- texto=${label} (${text.length} chars) ---`)

	const parser = makeParserOnly()
	const lexer = makeLexer()

	parser.text.set(text)
	lexer.text.set(text)
	const tokenCount = lexer.tokens.length
	const unknownCount = lexer.tokens.filter((t) => t.kind === 'unknown').length
	console.log(`    tokens: ${tokenCount} (unknown: ${unknownCount})`)

	const iterations = ITERATIONS[label]
	bench('Parser sozinho (resolve)', iterations, () => { parser.text.set(text === parser.text.value ? text + ' ' : text); void parser.root })
	bench('Lexer completo (parser + tokenize)', iterations, () => { lexer.text.set(text === lexer.text.value ? text + ' ' : text); void lexer.tokens })
}
