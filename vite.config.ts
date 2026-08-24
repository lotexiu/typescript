import { resolve } from "node:path";
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
				//
				// BUG (found 2026-08-23): setting `publicTrimmedFilePath: undefined` alone
				// does NOT "switch the target" — it only disables the one dtsRollup output
				// unplugin-dts had actually enabled (`dtsRollup.enabled: true` +
				// `publicTrimmedFilePath` defaulting to the real dist entry path), without
				// ever pointing `untrimmedFilePath` anywhere. api-extractor's own
				// diagnostics are set to `logLevel: "none"` by unplugin-dts, so this ran
				// silently: API Extractor "succeeded" but wrote to no file at all, and the
				// plain (non-bundled, still pointing at './capture-manager/model' etc. —
				// paths that don't exist in `dist/`) `insertTypesEntry` barrel written
				// earlier in the same pass was left as the final `dist/index.d.ts`. Every
				// generic type a consumer imports from the package (TPlugin<T>, Variant<K,V>,
				// ThemeStyle<...>, ...) silently degraded to `any`/`unknown` as a result —
				// confirmed by building `apps/react-desk` against it. Fix: actually enable
				// the untrimmed output at the real entry path instead of nulling out the
				// only configured one.
				extractorConfig: {
					dtsRollup: {
						publicTrimmedFilePath: undefined,
						untrimmedFilePath: resolve(process.cwd(), "dist/index.d.ts"),
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
