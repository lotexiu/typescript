import { defineConfig } from 'vitest/config';
import { tsconfigAliases } from './scripts/doc/tsconfig-alias';

export default defineConfig({
	resolve: {
		alias: tsconfigAliases(process.cwd()),
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
		globals: false,
		clearMocks: true,
	},
});
