import path from "path";
import { execFileSync } from "child_process";
import type { Plugin } from "vite";
import chokidar from "chokidar";

/**
 * Regenera o entry file (`src/index.ts`) no build, a partir da extração puramente sintática
 * de `scripts/doc/` (Lexer + Grammar da própria lib) — sem instanciar o compiler API do
 * TypeScript.
 *
 * O gerador roda num processo `tsx` separado, não importado aqui: `scripts/doc/index-gen.ts`
 * puxa `src/lexer` / `src/ast`, que só resolvem com os aliases `@ts/*` do `tsconfig.json` —
 * e o carregador de config do Vite (esbuild + Node) não aplica esses aliases. `tsx` aplica.
 *
 * `buildStart` cobre o caso que o watcher do Rollup já resolve bem: um arquivo *existente*
 * (já importado) mudando. Ele NÃO dispara para um arquivo novo que ninguém importa ainda —
 * um watcher `chokidar` separado observa `src/` para add/unlink e regenera nesses eventos.
 * Reescrever o entry devolve a mudança para o grafo observado do Rollup (ele É o entry
 * point), o que dispara o rebuild seguinte.
 */
export function indexGenPlugin(projectDir: string, entry: string): Plugin {
	const script = path.join(projectDir, "scripts/doc/index-gen.ts");

	function regenerate(): void {
		execFileSync(process.execPath, ["--import", "tsx", script, entry], {
			cwd: projectDir,
			stdio: "inherit",
		});
	}

	let watcherStarted = false;

	return {
		name: "index-gen-plugin",
		buildStart() {
			regenerate();
		},
		configResolved(config) {
			if (!config.build.watch) return;
			if (watcherStarted) return;
			watcherStarted = true;

			// chokidar v4 não tem suporte a globs (observa diretórios/arquivos literalmente),
			// então observa `src/` recursivamente e filtra por extensão no handler.
			const srcDir = path.join(projectDir, "src");
			const watcher = chokidar.watch(srcDir, { ignoreInitial: true });

			const handleStructuralChange = (changedPath: string) => {
				if (!changedPath.endsWith(".ts") && !changedPath.endsWith(".tsx")) return;
				regenerate();
			};

			watcher.on("add", handleStructuralChange);
			watcher.on("unlink", handleStructuralChange);
		},
	};
}
