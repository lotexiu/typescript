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
			bundleTypes: {
				// api-extractor's default "public trimmed" rollup deletes @internal-tagged
				// declarations (_Object, _String, ...) even when a public FooUtils member's
				// type still structurally references them (`typeof _Object.x`), leaving a
				// dangling type name in the emitted .d.ts. src/index.ts already curates the
				// public surface by simply never exporting the `_Foo` classes, so trimming
				// by release tag on top of that is redundant and actively breaks consumers.
				// Switching the rollup target to "untrimmed" keeps those declarations present
				// (as unexported locals) so the references resolve.
				extractorConfig: {
					dtsRollup: {
						publicTrimmedFilePath: undefined,
					},
				},
			},
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
