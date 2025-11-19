import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import {
	externalDependencies,
	extractTsconfigAliases,
	getLibraryEntries
} from "@lotexiu/vite-utils/utils";
import { betterOutDirCleanPlugin } from "@lotexiu/vite-utils/plugins/BetterOutDirClean";
import { preserveKeywordsPlugin } from "@lotexiu/vite-utils/plugins/PreserveKeywords";
import IndexPlugin from "@lotexiu/vite-utils/plugins/IndexPlugin";
import { distPackageJson } from "@lotexiu/vite-utils/plugins/DistPackageJson";

const libSrc = path.resolve(__dirname, "src");
const entries = getLibraryEntries(libSrc);

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
		betterOutDirCleanPlugin(),
		distPackageJson("@lotexiu/typescript"),
		preserveKeywordsPlugin(),
		IndexPlugin()
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
