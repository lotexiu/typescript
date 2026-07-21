import { defineConfig } from "vite";
import dts from 'vite-plugin-dts';
import { AnalyzerProject } from "./scripts/analyzer/model";
import { analyzerPlugin } from "./scripts/vite-plugin";

const entryFile = "src/index.ts"
const project = new AnalyzerProject(process.cwd());

export default defineConfig({
	resolve: {
		alias: project.resolvedAlias()
	},
	plugins: [
		analyzerPlugin(project, entryFile),
		dts({
			outDirs: 'dist',
			insertTypesEntry: true,
			bundleTypes: true,
		}),
	],
	build: {
		minify: false,
		lib: {
			name: 'index',
			entry: `./${entryFile}`,
			formats: ["es", "umd"],
			fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`
		}
	},
});
