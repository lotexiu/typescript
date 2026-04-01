import { defineConfig } from 'vitest/config';
import { extractTsconfigAliases } from '@lotexiu/vite-utils/utils';

console.clear();
export default defineConfig({
	resolve: {
		alias: extractTsconfigAliases(),
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts'],
		globals: false,
		clearMocks: true,
	},
});
