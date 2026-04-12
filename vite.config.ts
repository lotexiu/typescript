import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import {
	externalDependencies,
	extractTsconfigAliases,
	getLibraryEntries,
} from "@lotexiu/vite-utils/utils";
import { betterOutDirCleanPlugin } from "@lotexiu/vite-utils/plugins/BetterOutDirClean";
import { packageJsonPlugin } from "@lotexiu/vite-utils/plugins/PackageJsonPlugin";
import { createIndexFile } from "@lotexiu/vite-utils/plugins/IndexPlugin";

const libSrc = path.resolve(__dirname, "src");
const sourceOptions = {
	ignoredDirs: [".test", "test", "tests", "__tests__"],
	ignoredPathPatterns: [
		/\.test\.(ts|tsx|js)$/,
		/\.spec\.(ts|tsx|js)$/,
		/\.e2e\.(ts|tsx|js)$/,
		/\/__mocks__\//,
		/\/__fixtures__\//,
	],
};
const entries = getLibraryEntries(libSrc, false, sourceOptions);

createIndexFile(libSrc, sourceOptions);
entries["index"] = path.resolve(libSrc, "index.ts");

export default defineConfig({
	resolve: {
		alias: extractTsconfigAliases(),
	},
	plugins: [
		dts({
			include: ["src"],
			exclude: [
				"src/.test/**",
				"src/**/__tests__/**",
				"src/**/*.test.ts",
				"src/**/*.test.tsx",
				"src/**/*.test.js",
				"src/**/*.spec.ts",
				"src/**/*.spec.tsx",
				"src/**/*.spec.js",
			],
			outDir: "dist",
			insertTypesEntry: false,
		}),
		betterOutDirCleanPlugin(),
		packageJsonPlugin(["dist", "./"], { generateExports: false }),
	],
	build: {
		minify: false, // Obrigatório para que o refresh rapido do react funcione.
		emptyOutDir: true,
		lib: {
			entry: entries,
			fileName: (format, entryName) => {
				const ext = format === "es" ? "js" : "cjs";
				return `${entryName}.${ext}`;
			},
		},
		rollupOptions: {
			external: externalDependencies(),
			output: [
				{
					format: "es",
					dir: "dist",
					entryFileNames: "[name].js",
					chunkFileNames: "chunks/[name]-[hash].js",
					preserveModules: true,
					preserveModulesRoot: "src",
					exports: "named",
				},
				{
					format: "cjs",
					dir: "dist",
					entryFileNames: "[name].cjs", // Força extensão .cjs
					chunkFileNames: "chunks/[name]-[hash].cjs",
					preserveModules: true,
					preserveModulesRoot: "src",
					exports: "named",
				},
			],
		},
	},
});
