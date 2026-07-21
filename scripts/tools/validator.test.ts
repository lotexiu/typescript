import { describe, expect, it, vi } from 'vitest';
import { validateProject } from './validator';
import type { AnalyzerProject } from '../analyzer/model';
import type { ProjectBlockCode } from '../analyzer/block/types';

function makeBlock(overrides: Partial<ProjectBlockCode> = {}): ProjectBlockCode {
	const block = {
		name: 'doIt',
		category: 'function',
		context: 'local',
		isTypeOnly: false,
		exportStatus: 'not-exported',
		documentation: undefined,
		location: { file: 'src/foo.ts', start: 0, end: 0, startLine: 1, endLine: 1 },
		parentFile: undefined as any,
		importedBy: [],
		getText: () => '',
		getAstNode: () => undefined as any,
		isInternal(this: ProjectBlockCode) {
			return this.documentation?.tags.some((t) => t.name === 'internal') ?? false;
		},
		...overrides,
	};
	return block;
}

function makeProject(files: any[]): AnalyzerProject {
	return {
		files,
		getReferenceGraph: () => new Map(),
	} as unknown as AnalyzerProject;
}

function runAndCollectWarnings(project: AnalyzerProject): string[] {
	const logs: string[] = [];
	const spy = vi.spyOn(console, 'log').mockImplementation((msg: unknown) => {
		logs.push(String(msg));
	});
	try {
		validateProject(project, 'src/index.ts');
	} finally {
		spy.mockRestore();
	}
	return logs;
}

describe('validateProject — missing documentation rule', () => {
	it('warns when a public export has no documentation at all', () => {
		const block = makeBlock({ documentation: undefined });
		const file = {
			relativePath: 'src/foo.ts',
			exports: [{ name: 'doIt', isDefault: false, blockCode: block }],
		};

		const logs = runAndCollectWarnings(makeProject([file]));

		expect(logs.some((l) => l.includes('has no documentation'))).toBe(true);
	});

	it('does not warn when the export has a JSDoc description', () => {
		const block = makeBlock({ documentation: { description: 'Does the thing.', tags: [] } });
		const file = {
			relativePath: 'src/foo.ts',
			exports: [{ name: 'doIt', isDefault: false, blockCode: block }],
		};

		const logs = runAndCollectWarnings(makeProject([file]));

		expect(logs.some((l) => l.includes('has no documentation'))).toBe(false);
	});

	it('does not warn about missing documentation for @internal exports', () => {
		const block = makeBlock({
			name: '_Internal',
			documentation: { description: '', tags: [{ name: 'internal' }] },
		});
		const file = {
			relativePath: 'src/foo.ts',
			exports: [{ name: '_Internal', isDefault: false, blockCode: block }],
		};

		const logs = runAndCollectWarnings(makeProject([file]));

		expect(logs.some((l) => l.includes('has no documentation'))).toBe(false);
	});
});
