import { readFileSync } from 'node:fs'
import { Parser } from '../src/parser/model'
import { ParserGate, ParserNode, ParserRoot } from '../src/parser/node/model'
import { Parser as OldParser, ParserGate as OldParserGate, ParserNode as OldParserNode, ParserRoot as OldParserRoot } from '../src/.old-parser/model'

const SOURCE_PATH = 'src/natives/string/implementations.ts'
const ITERATIONS = 2000
const WARMUP = 200

const text = readFileSync(SOURCE_PATH, 'utf-8')

function makeNewParser(trackGaps = false) {
	const parser = new Parser()
	parser.trackGaps = trackGaps
	parser.escape = '\\'
	parser.addGates(
		new ParserGate('{', '}'),
		new ParserGate('(', ')'),
		new ParserGate('[', ']'),
		new ParserGate("'", "'", true),
		new ParserGate('"', '"', true),
		new ParserGate('`', '`', true),
		new ParserGate('/*', '*/', true),
		new ParserGate('//', '\n', true),
	)
	return parser
}

function makeOldParser() {
	const parser = new OldParser()
	parser.escape = '\\'
	parser.addGates(
		new OldParserGate('{', '}'),
		new OldParserGate('(', ')'),
		new OldParserGate('[', ']'),
		new OldParserGate("'", "'", true),
		new OldParserGate('"', '"', true),
		new OldParserGate('`', '`', true),
		new OldParserGate('/*', '*/', true),
		new OldParserGate('//', '\n', true),
	)
	return parser
}

// --- Correctness: novo parser reconstrói o texto original 100% via nodes+gaps ---
function reconstruct(scope: ParserNode | ParserRoot): string {
	const items: { start: number; str: string }[] = []
	for (const child of scope.children) {
		const inner = reconstruct(child)
		items.push({
			start: child.start,
			str: child.gate.open + inner + (child.unclosed ? '' : child.gate.close),
		})
	}
	for (const gap of scope.gaps) {
		items.push({ start: gap.start, str: gap.text.value })
	}
	items.sort((a, b) => a.start - b.start)
	return items.map((i) => i.str).join('')
}

function countNodes(node: ParserNode | ParserRoot): number {
	return node.children.reduce((sum, child) => sum + 1 + countNodes(child), 0)
}

console.log(`=== Parser comparison — ${SOURCE_PATH} (${text.length} chars) ===\n`)

const newParser = makeNewParser(true)
newParser.text.set(text)
const newRoot = newParser.root

const oldParser = makeOldParser()
oldParser.text = text
oldParser.resolve()
const oldRoot = oldParser.root!

console.log('--- Estrutura ---')
console.log(`novo:  ${countNodes(newRoot)} nodes, ${newRoot.allGaps.length} gaps (flat), ${newRoot.nodes.length} nodes (flat)`)
console.log(`velho: ${oldRoot.nodes.length} nodes (flat) — sem gaps`)

const unclosed = newRoot.nodes.filter((n) => n.unclosed)
console.log(`novo:  ${unclosed.length} nodes unclosed`)

const rebuilt = reconstruct(newRoot)
console.log(`novo:  round-trip (nodes+gaps -> texto original) = ${rebuilt === text ? 'OK' : 'FALHOU'}`)
if (rebuilt !== text) {
	const firstDiff = [...text].findIndex((c, i) => rebuilt[i] !== c)
	console.log(`  primeira diferença no índice ${firstDiff}`)
}

// sanity extra: um node de exemplo com conteúdo lazy
const sample = newRoot.nodes.find((n) => n.gate.open === '{' && !n.unclosed)
if (sample) {
	console.log(`\nexemplo de node '{': start=${sample.start} end=${sample.end} content.length=${sample.content.value.length}`)
}

// --- Benchmark ---
console.log('\n--- Benchmark (resolve completo por iteração) ---')

function benchNew(trackGaps: boolean): number {
	const parser = makeNewParser(trackGaps)
	for (let i = 0; i < WARMUP; i++) {
		parser.text.set(i % 2 === 0 ? text : text + ' ')
		void parser.root
	}
	const start = performance.now()
	for (let i = 0; i < ITERATIONS; i++) {
		parser.text.set(i % 2 === 0 ? text : text + ' ')
		void parser.root
	}
	return performance.now() - start
}

function benchOld(): number {
	const parser = makeOldParser()
	for (let i = 0; i < WARMUP; i++) {
		parser.text = i % 2 === 0 ? text : text + ' '
		parser.resolve()
	}
	const start = performance.now()
	for (let i = 0; i < ITERATIONS; i++) {
		parser.text = i % 2 === 0 ? text : text + ' '
		parser.resolve()
	}
	return performance.now() - start
}

const newDefaultMs = benchNew(false)
const newWithGapsMs = benchNew(true)
const oldMs = benchOld()

console.log(`velho:               ${oldMs.toFixed(2)}ms total, ${(oldMs / ITERATIONS).toFixed(4)}ms/iter`)
console.log(`novo (trackGaps=false, padrão): ${newDefaultMs.toFixed(2)}ms total, ${(newDefaultMs / ITERATIONS).toFixed(4)}ms/iter — ${(((newDefaultMs - oldMs) / oldMs) * 100).toFixed(1)}% vs velho`)
console.log(`novo (trackGaps=true):          ${newWithGapsMs.toFixed(2)}ms total, ${(newWithGapsMs / ITERATIONS).toFixed(4)}ms/iter — ${(((newWithGapsMs - oldMs) / oldMs) * 100).toFixed(1)}% vs velho`)

// --- Lazy access: só computa quando .root é acessado, e não recomputa sem mudança ---
console.log('\n--- Laziness ---')
const lazyParser = makeNewParser()
lazyParser.text.set(text)
const before = performance.now()
void lazyParser.root
void lazyParser.root
void lazyParser.root
const cachedAccessMs = performance.now() - before
console.log(`3x acesso a .root sem mudar texto: ${cachedAccessMs.toFixed(4)}ms (deve ser ~0, só recomputa 1x)`)
