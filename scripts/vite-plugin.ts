import path from "path";
import type { Plugin } from "vite";
import chokidar from "chokidar";
import { AnalyzerProject } from "./analyzer/model";
import { createEntryFile } from "./tools/index-generator";
import { validateProject } from "./tools/validator";

/**
 * Wires the analyzer + index-generator + validator into the Vite build as a
 * real plugin instead of the old top-level `createEntryFile(...)` /
 * `validateProject(...)` calls that ran once at `vite.config.ts` eval time.
 *
 * `buildStart` covers the case Rollup's own watcher already handles well:
 * an *existing* (already-imported) file changing. It does NOT fire for a
 * brand-new file nobody imports yet — that file can never enter Rollup's
 * watched graph on its own, which is exactly the "new file not picked up
 * until restart" gap documented in CLAUDE.md. A separate `chokidar` watcher
 * (already a devDependency, previously unused) watches `src/` directly for
 * add/unlink — structural changes only, not edits — and re-runs the
 * analyzer + regenerates the entry on those. Rewriting the entry file then
 * lands back inside Rollup's own watched graph (it's the entry point),
 * which is what triggers the follow-up rebuild.
 */
export function analyzerPlugin(project: AnalyzerProject, entry: string): Plugin {
	function regenerate(): void {
		createEntryFile(project, entry);
		validateProject(project, entry);
	}

	let watcherStarted = false;

	return {
		name: "analyzer-plugin",
		buildStart() {
			regenerate();
		},
		configResolved(config) {
			if (!config.build.watch) return;
			if (watcherStarted) return;
			watcherStarted = true;

			// chokidar v4 dropped glob support (watches directories/files literally),
			// so this watches `src/` recursively and filters by extension itself.
			const srcDir = path.join(project.dir, "src");
			const watcher = chokidar.watch(srcDir, { ignoreInitial: true });

			const handleStructuralChange = (changedPath: string) => {
				if (!changedPath.endsWith(".ts") && !changedPath.endsWith(".tsx")) return;
				project.refresh();
				regenerate();
			};

			watcher.on("add", handleStructuralChange);
			watcher.on("unlink", handleStructuralChange);
		},
	};
}
