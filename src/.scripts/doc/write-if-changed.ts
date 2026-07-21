import fs from "fs"
import path from "path"

/**
 * Escreve `content` em `filePath` só quando o conteúdo muda. `src/index.ts` é o entry point
 * do Rollup — reescrever byte-idêntico bumpa o mtime e re-trigga o build em loop no watch
 * mode.
 *
 * Retorna `true` se escreveu, `false` se já estava atualizado.
 */
function writeIfChanged(filePath: string, content: string): boolean {
	if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf-8") === content) return false
	fs.mkdirSync(path.dirname(filePath), { recursive: true })
	fs.writeFileSync(filePath, content)
	return true
}

export {
	writeIfChanged,
}
