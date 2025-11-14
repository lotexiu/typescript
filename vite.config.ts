import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import {
	externalDependencies,
	extractTsconfigAliases,
	getLibraryEntries
} from "@lotexiu/vite-utils/utils";
import { updatePackageJsonPlugin } from "@lotexiu/vite-utils/plugins/MainPackage";
import { betterOutDirCleanPlugin } from "@lotexiu/vite-utils/plugins/BetterOutDirClean";
import { preserveKeywordsPlugin } from "@lotexiu/vite-utils/plugins/PreserveKeywords";

const libSrc = path.resolve(__dirname, "src");
const entries = getLibraryEntries(libSrc);

export default defineConfig({
	resolve: {
		alias: extractTsconfigAliases(),
	},
	plugins: [
		preserveKeywordsPlugin(),
		dts({
			include: ["src"],
			outDir: "dist",
			insertTypesEntry: false,
		}),
		betterOutDirCleanPlugin(),
		updatePackageJsonPlugin(),
	],
	build: {
		minify: false, // Obrigatório para que o refresh rapido do react funcione.
		lib: {
			entry: entries,
			formats: ["cjs", "es"],
		},
		emptyOutDir: false,
		rollupOptions: {
			external: externalDependencies(),
			output: {
				dir: "dist",
				assetFileNames: "[name].[ext]",
				exports:"named"
			},
		},
	},
});
