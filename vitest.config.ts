import { defineConfig } from 'vitest/config';
import { AnalyzerProject } from './scripts/analyzer/model';

const project = new AnalyzerProject(process.cwd());

export default defineConfig({
	resolve: {
		alias: project.resolvedAlias(),
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
		globals: false,
		clearMocks: true,
	},
});
