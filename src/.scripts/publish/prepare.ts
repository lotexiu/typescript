import fs from "fs"
import path from "path"
import { extractFile, toPosixPath, walkSourceFiles } from "../doc/extract"
import { ApiSummaryUtils } from "./api-summary"
import { DIST_DIRECTORY, WORKSPACE_PROTOCOL } from "./declarations"
import { ManifestUtils } from "./manifest"
import { ReadmeUtils } from "./readme"

/**
 * Prepara `dist/` para `npm publish ./dist`, em qualquer pacote do monorepo (roda a partir da pasta do pacote):
 * `package.json` só com os campos de publicação, entradas apontando para dentro do `dist` e `workspace:` resolvido;
 * `LICENSE`; `README.md` com links absolutos; e `API.md` com o resumo de cada símbolo público.
 */

const ROOT = process.cwd()
const DIST = path.join(ROOT, DIST_DIRECTORY)

function main(): void {
	if (!fs.existsSync(DIST)) throw new Error("dist/ não existe — rode o build antes")
	const source = ManifestUtils.read(path.join(ROOT, "package.json"))
	const generatedFile = path.join(DIST, "package.json")
	const generated = fs.existsSync(generatedFile) ? ManifestUtils.read(generatedFile) : undefined
	const manifest = ManifestUtils.forPublication(source, generated, ManifestUtils.workspaceVersions(ROOT))
	const text = JSON.stringify(manifest, null, 2)
	if (text.includes(WORKSPACE_PROTOCOL)) throw new Error("dist/package.json ainda tem dependência workspace:")
	fs.writeFileSync(generatedFile, text + "\n")

	const licenseFile = path.join(ROOT, "LICENSE")
	if (fs.existsSync(licenseFile)) fs.copyFileSync(licenseFile, path.join(DIST, "LICENSE"))

	const repositoryUrl = ManifestUtils.repositoryUrl(manifest)
	const readmeFile = path.join(ROOT, "README.md")
	if (fs.existsSync(readmeFile)) {
		const readme = ReadmeUtils.absoluteLinks(fs.readFileSync(readmeFile, "utf-8"), repositoryUrl)
		fs.writeFileSync(path.join(DIST, "README.md"), ReadmeUtils.withApiNote(readme, repositoryUrl))
	}

	const files = walkSourceFiles(path.join(ROOT, "src")).map((absolute) => extractFile(absolute, toPosixPath(path.relative(ROOT, absolute))))
	fs.writeFileSync(path.join(DIST, "API.md"), ApiSummaryUtils.render(manifest.name, manifest.version, files, repositoryUrl))

	console.log(`dist/ pronto para publicar ${manifest.name}@${manifest.version}`)
}

main()
