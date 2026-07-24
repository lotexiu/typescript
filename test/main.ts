import { readFileSync } from "fs";
import { benchmark, benchmarkResult, convert, marginError, timeExecution } from "./utils/util";
import { declareGates, Lexer as LexerV1 } from "./samples/v1";
import { Gate as GateV2, Lexer as LexerV2 } from "./samples/v2";

const text = readFileSync('./test/examples/test.txt', 'utf-8')

const lixer1 = new LexerV1(text, {
	escape: '\\',
	gates: declareGates
		('{', '}')
		('[', ']')
		('(', ')')
		('"', '"', true)
		("'", "'", true)
		('`', '`', true)
		('/*', '*/', true)
	.end
})

const lexer2 = new LexerV2(
	text,
	'\\',
	[
		new GateV2('{', '}'),
		new GateV2('(', ')'),
		new GateV2('[', ']'),
		new GateV2('"', '"', true),
		new GateV2("'", "'", true),
		new GateV2('`', '`', true),
		new GateV2('/*', '*/', true),
	]
)

const {unit, value} = convert(marginError)
console.log(`Time margin error: ${value} ${unit}`)
console.log('Benchmarking...\n')

benchmark(
	()=>{lixer1.resolve()},
	(ms, it) => benchmarkResult('Lexer1', it, ms),
	50000
)

benchmark(
	()=>{lexer2.resolve()},
	(ms, it) => benchmarkResult('Lexer2', it, ms),
	50000
)