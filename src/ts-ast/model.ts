import path from 'path';
import fs from 'fs';
import ts from 'typescript'
import { Parser, ParserGate } from "@ts/parser/model";
import { SpyUtils } from '@ts/spy/utils';

const basePath = process.cwd()

class TSAST {
	constructor() {
		SpyUtils.benchmark(() => this.resolve(),1)
	}
	
	resolve() {
		const { config, error } = ts.readConfigFile(path.join(basePath, 'tsconfig.json'), ts.sys.readFile);
		const rootDir = `${basePath}/${config.compilerOptions.rootDir}`;
		const alias = config.compilerOptions.paths || {};
	
		const parser = new Parser()
		parser.escape = '\\'
		parser.addGates(
			new ParserGate('{', '}'),
			new ParserGate('(', ')'),
			new ParserGate('[', ']'),
			new ParserGate('"', '"', true),
			new ParserGate("'", "'", true),
			new ParserGate('`', '`', true),
			new ParserGate('/*', '*/', true),
		)
		
		fs.readdirSync(rootDir, {recursive: true, withFileTypes: true}).forEach(data => {
			if(!data.isFile()) return;
			const text = fs.readFileSync(`${data.parentPath}/${data.name}`, 'utf8')
			parser.text = text;
			parser.resolve();
		})
		
	}
}


export {
	TSAST
}