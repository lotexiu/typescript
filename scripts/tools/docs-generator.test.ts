import { describe, expect, it } from 'vitest';
import { generateDocs } from './docs-generator';
import type { AnalyzerProject } from '../analyzer/model';
import type { ProjectBlockCode } from '../analyzer/block/types';

function makeBlock(overrides: Partial<ProjectBlockCode> = {}): ProjectBlockCode {
	return {
		name: 'PublicThing',
		category: 'function',
		context: 'local',
		isTypeOnly: false,
		exportStatus: 'not-exported',
		documentation: { description: 'Public.', tags: [] },
		location: { file: 'src/foo/implementations.ts', start: 0, end: 0, startLine: 12, endLine: 12 },
		parentFile: undefined as any,
		importedBy: [],
		getText: () => '',
		getAstNode: () => undefined as any,
		isInternal(this: ProjectBlockCode) {
			return this.documentation?.tags.some((t) => t.name === 'internal') ?? false;
		},
		...overrides,
	};
}

function makeProject(files: any[], repoUrl?: string): { project: AnalyzerProject; written: Record<string, string> } {
	const written: Record<string, string> = {};
	const project = {
		dir: '/tmp/does-not-exist-docs-generator-test',
		files,
		packageJson: repoUrl ? { repository: { url: repoUrl } } : {},
		writeFile: (p: string, content: string) => {
			written[p.replace(/\\/g, '/')] = content;
		},
	} as unknown as AnalyzerProject;
	return { project, written };
}

describe('generateDocs', () => {
	it('groups blocks by their containing module directory into one page each', () => {
		const maskBlock = makeBlock({ name: 'MaskThing', location: { file: 'src/mask/utils.ts', start: 0, end: 0, startLine: 3, endLine: 3 } });
		const objectBlock = makeBlock({ name: 'ObjectThing', location: { file: 'src/natives/object/utils.ts', start: 0, end: 0, startLine: 5, endLine: 5 } });

		const files = [
			{ relativePath: 'src/mask/utils.ts', blocks: [maskBlock], exports: [{ name: 'MaskThing', isDefault: false, blockCode: maskBlock }] },
			{ relativePath: 'src/natives/object/utils.ts', blocks: [objectBlock], exports: [{ name: 'ObjectThing', isDefault: false, blockCode: objectBlock }] },
		];

		const { project, written } = makeProject(files);
		generateDocs(project, { entry: 'src/index.ts' });

		expect(written['docs/modules/mask.md']).toContain('MaskThing');
		expect(written['docs/modules/natives-object.md']).toContain('ObjectThing');
		expect(written['docs/modules/mask.md']).not.toContain('ObjectThing');
	});

	it('links each entry to its exact source line, two directories up from the module page', () => {
		const block = makeBlock({
			name: 'PublicThing',
			location: { file: 'src/mask/utils.ts', start: 0, end: 0, startLine: 42, endLine: 42 },
		});
		const files = [{ relativePath: 'src/mask/utils.ts', blocks: [block], exports: [{ name: 'PublicThing', isDefault: false, blockCode: block }] }];

		const { project, written } = makeProject(files);
		generateDocs(project, { entry: 'src/index.ts' });

		expect(written['docs/modules/mask.md']).toContain('[`PublicThing`](../../src/mask/utils.ts#L42)');
	});

	it('never repeats the actual source code in any generated file', () => {
		const block = makeBlock({ documentation: { description: 'Does the thing.', tags: [] } });
		const files = [{ relativePath: 'src/foo/implementations.ts', blocks: [block], exports: [{ name: 'PublicThing', isDefault: false, blockCode: block }] }];

		const { project, written } = makeProject(files);
		generateDocs(project, { entry: 'src/index.ts' });

		expect(written['docs/modules/foo.md']).not.toContain('```');
	});

	it('PROJECT.md indexes every block (internal or not) with a link into its module page', () => {
		const publicBlock = makeBlock({ name: 'PublicThing' });
		const internalBlock = makeBlock({
			name: '_Internal',
			documentation: { description: '', tags: [{ name: 'internal' }] },
		});
		const files = [{
			relativePath: 'src/foo/implementations.ts',
			blocks: [publicBlock, internalBlock],
			exports: [
				{ name: 'PublicThing', isDefault: false, blockCode: publicBlock },
				{ name: '_Internal', isDefault: false, blockCode: internalBlock },
			],
		}];

		const { project, written } = makeProject(files);
		generateDocs(project, { entry: 'src/index.ts' });

		expect(written['docs/PROJECT.md']).toContain('[`PublicThing`](modules/foo.md#PublicThing)');
		expect(written['docs/PROJECT.md']).toContain('[`_Internal`](modules/foo.md#_Internal)');
	});

	it('API.md only lists public names with their kind — no descriptions, no links, no code', () => {
		const publicBlock = makeBlock({ name: 'PublicThing' });
		const internalBlock = makeBlock({
			name: '_Internal',
			documentation: { description: '', tags: [{ name: 'internal' }] },
		});
		const files = [{
			relativePath: 'src/foo/implementations.ts',
			blocks: [publicBlock, internalBlock],
			exports: [
				{ name: 'PublicThing', isDefault: false, blockCode: publicBlock },
				{ name: '_Internal', isDefault: false, blockCode: internalBlock },
			],
		}];

		const { project, written } = makeProject(files, 'https://github.com/lotexiu/typescript');
		generateDocs(project, { entry: 'src/index.ts' });

		expect(written['docs/API.md']).toContain('`PublicThing` _(function)_');
		expect(written['docs/API.md']).not.toContain('_Internal');
		expect(written['docs/API.md']).not.toContain('Does the thing');
		expect(written['docs/API.md']).not.toContain('```');
		expect(written['docs/API.md']).toContain('https://github.com/lotexiu/typescript');
	});

	it('skips the generated entry file itself', () => {
		const files = [{ relativePath: 'src/index.ts', blocks: [makeBlock({ name: 'ReexportedThing' })], exports: [] }];

		const { project, written } = makeProject(files);
		generateDocs(project, { entry: 'src/index.ts' });

		expect(written['docs/PROJECT.md']).not.toContain('ReexportedThing');
		expect(Object.keys(written).some((p) => p.startsWith('docs/modules/'))).toBe(false);
	});
});
