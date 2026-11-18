import { defineConfig } from 'vitest/config';
import { tsconfigAliases } from './src/.scripts/doc/tsconfig-alias.ts';

export default defineConfig({
	resolve: {
		alias: tsconfigAliases(process.cwd()),
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts', 'src/.*/**/*.test.ts'],
		globals: false,
		clearMocks: true,
	},
});
