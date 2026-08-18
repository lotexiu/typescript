import fs from 'fs';
import path from 'path';
import './src/index';
import { MathUtils, Parser, ParserGate, TSAST } from './src/index';



new TSAST()

// const text = fs.readFileSync(path.join(process.cwd(), 'src/index.ts'), 'utf8')


// const parser = new Parser()

// parser.text = text
// parser.resolve()

// console.log(parser.root)