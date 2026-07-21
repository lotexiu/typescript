import path from "path";
import ts from "typescript";
import { ProjectFile } from "./file/model";
import fs from "fs";
import { ResolvedAlias } from "./types";


export class AnalyzerProject {
	private program?: ts.Program;

	private _files: ProjectFile[] = [];
	private filesMap = new Map<string, ProjectFile>();

	private _include: string[] = [];
	private _exclude: string[] = [];
	private _paths: Record<string, string[]> = {};

	private _pkg: any;
	private _referenceGraphCache: Map<string, Set<ProjectFile>> | undefined;

	constructor(public readonly dir: string) {
		this.refresh();
	}

	get files(): ProjectFile[] { return this._files; }
	get include(): string[] { return this._include; }
	get exclude(): string[] { return this._exclude; }
	get packageJson(): any { return this._pkg; }
	get aliases(): Record<string, string[]> { return this._paths; }
	get dependencies(): string[] {
		const { peerDependencies = {}, dependencies = {} } = this._pkg;
		return [...Object.keys(peerDependencies), ...Object.keys(dependencies)];
	}

	public getProgram(): ts.Program | undefined {
		return this.program;
	}

 	public getFile(relativePath: string): ProjectFile | undefined {
		return this.filesMap.get(relativePath);
	}

	getReferenceGraph(): Map<string, Set<ProjectFile>> {
		if (this._referenceGraphCache) return this._referenceGraphCache;

		this._referenceGraphCache = new Map();
		const program = this.program;
		if (!program) return this._referenceGraphCache;

		const checker = program.getTypeChecker();
		const visit = (node: ts.Node, currentFile: ProjectFile): void => {
			if (ts.isIdentifier(node)) {
				const symbol = checker.getSymbolAtLocation(node);
				if (symbol) {
					const name = symbol.getName();
					const set = this._referenceGraphCache!.get(name);
					if (set) {
						set.add(currentFile);
					} else {
						this._referenceGraphCache!.set(name, new Set([currentFile]));
					}
				}
			}
			ts.forEachChild(node, (child) => visit(child, currentFile));
		};

		for (const file of this._files) {
			const sf = file.getSourceFile();
			for (const child of sf.statements) {
				visit(child, file);
			}
		}

		return this._referenceGraphCache;
	}

	public refresh() {
		const configPath = ts.findConfigFile(this.dir, ts.sys.fileExists, "tsconfig.json");
		if (!configPath) throw new Error("Não foi possível encontrar o arquivo tsconfig.json");

		const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
		const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, this.dir);
		this._paths = parsedConfig.options.paths || {};
		this._include = parsedConfig.raw.include || [];
		this._exclude = parsedConfig.raw.exclude || [];

		const pkgPath = path.join(this.dir, "package.json");
		this._pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

		this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options, undefined, this.program);
		this._referenceGraphCache = undefined;

		for (const file of this._files) {
			file.clearCache();
		}

		const currentFilesMap = new Map<string, ProjectFile>();
		const currentFilesList: ProjectFile[] = [];

		for (const fileName of parsedConfig.fileNames) {
			const relativePath = path.relative(this.dir, fileName);
			if (relativePath.startsWith("node_modules")) continue;
			const ext = path.extname(fileName);
			let fileObj = this.filesMap.get(relativePath);
			if (!fileObj) {
				fileObj = new ProjectFile(
					path.basename(fileName),
					ext,
					relativePath,
					fileName,
					this
				);
			}

			currentFilesMap.set(relativePath, fileObj);
			currentFilesList.push(fileObj);
		}

		this.filesMap = currentFilesMap;
		this._files = currentFilesList;
	}

	resolvedAlias(): ResolvedAlias[] {
		const regex = /\/\*$/;
		const resolvedAlias: ResolvedAlias[] = [];
		Object.entries(this.aliases).forEach(([alias, targets]) => {
			const cleanedAlias = alias.replace(regex, "");
			targets.forEach(target => {
				const cleanedTarget = target.replace(regex, "");
				const absolutePath = path.resolve(this.dir, cleanedTarget);
				resolvedAlias.push({
					find: new RegExp(`^${cleanedAlias}(/.*|$)`),
					replacement: `${absolutePath}$1`
				})
			})
		})
		return resolvedAlias;
	}

	/**
	 * Skips the write when the content is unchanged — important for generated files that
	 * are also part of the watched build graph (e.g. the entry file): an unconditional
	 * write on every rebuild would bump the file's mtime even with identical content,
	 * which the watcher sees as a change and rebuilds again, forever.
	 */
	writeFile(file: string, content: string) {
		const filePath = path.join(this.dir, file);
		if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf-8") === content) return;
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.writeFileSync(filePath, content);
	}
}
