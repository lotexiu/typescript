import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import {
	externalDependencies,
	extractTsconfigAliases,
	getLibraryEntries,
	loadRootPackage,
} from "@lotexiu/vite-utils/utils";
import { updatePackageJsonPlugin } from "@lotexiu/vite-utils/plugins/MainPackage";
import { betterOutDirCleanPlugin } from "@lotexiu/vite-utils/plugins/BetterOutDirClean";

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
		updatePackageJsonPlugin(),
	],
	build: {
		lib: {
			entry: entries,
		},
		emptyOutDir: false,
		// ... outras configurações ...
		rollupOptions: {
			external: externalDependencies(),
			output: {
				dir: "dist",
				format: "es",
				assetFileNames: "[name].[ext]",
			},
		},
	},
});
