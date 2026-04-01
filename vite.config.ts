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
import { excludeEmptyChunksPlugin } from "@lotexiu/vite-utils/plugins/ExcludeEmptyChunks";

const libSrc = path.resolve(__dirname, "src");
const entries = getLibraryEntries(libSrc);

createIndexFile(libSrc);
entries["index"] = path.resolve(libSrc, "index.ts");

export default defineConfig({
	resolve: {
		alias: extractTsconfigAliases(),
	},
	plugins: [
		dts({
			include: ["src"],
			outDir: "dist",
			insertTypesEntry: false,
		}),
		excludeEmptyChunksPlugin(),
		betterOutDirCleanPlugin(),
		packageJsonPlugin(["dist", "./"]),
	],
	build: {
		minify: false, // Obrigatório para que o refresh rapido do react funcione.
		emptyOutDir: false,
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
