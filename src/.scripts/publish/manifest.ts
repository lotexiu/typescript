import fs from "fs"
import path from "path"
import { DEPENDENCY_FIELDS, DIST_PREFIX, ENTRY_FIELDS, MANIFEST_FIELDS, PUBLISH_REGEX, WORKSPACE_PROTOCOL } from "./declarations"
import { TManifest } from "./types"

class ManifestUtils {
	static read(file: string): TManifest {
		return JSON.parse(fs.readFileSync(file, "utf-8"))
	}

	static workspaceVersions(packageRoot: string): Map<string, string> {
		const versions = new Map<string, string>()
		const packagesDirectory = path.dirname(packageRoot)
		for (const entry of fs.readdirSync(packagesDirectory, { withFileTypes: true })) {
			const manifestFile = path.join(packagesDirectory, entry.name, "package.json")
			if (!entry.isDirectory() || !fs.existsSync(manifestFile)) continue
			const manifest = ManifestUtils.read(manifestFile)
			versions.set(manifest.name, manifest.version)
		}
		return versions
	}

	static resolveWorkspace(range: string, version: string): string {
		const specifier = range.slice(WORKSPACE_PROTOCOL.length)
		if (specifier === "*" || specifier === "^") return `^${version}`
		if (specifier === "~") return `~${version}`
		return specifier
	}

	static stripDist(value: unknown): unknown {
		if (typeof value === "string") return value.startsWith(DIST_PREFIX) ? `./${value.slice(DIST_PREFIX.length)}` : value
		if (Array.isArray(value)) return value.map(ManifestUtils.stripDist)
		if (typeof value === "object" && value !== null) {
			return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, inner]) => [key, ManifestUtils.stripDist(inner)]))
		}
		return value
	}

	static forPublication(source: TManifest, generated: TManifest | undefined, versions: ReadonlyMap<string, string>): TManifest {
		const manifest: Record<string, unknown> = {}
		for (const field of MANIFEST_FIELDS) if (source[field] !== undefined) manifest[field] = source[field]
		for (const field of ENTRY_FIELDS) {
			const value = generated?.[field] ?? ManifestUtils.stripDist(source[field])
			if (value !== undefined) manifest[field] = value
		}
		for (const field of DEPENDENCY_FIELDS) {
			const fromBuild = generated?.[field] as Record<string, string> | undefined
			const dependencies = fromBuild === undefined ? (manifest[field] as Record<string, string> | undefined) : { ...fromBuild, ...(manifest[field] as Record<string, string> | undefined) }
			if (dependencies === undefined) continue
			manifest[field] = Object.fromEntries(
				Object.entries(dependencies).map(([name, range]) => {
					if (!range.startsWith(WORKSPACE_PROTOCOL)) return [name, range]
					const version = versions.get(name)
					if (version === undefined) throw new Error(`${name}: dependência ${range} sem pacote correspondente no workspace`)
					return [name, ManifestUtils.resolveWorkspace(range, version)]
				})
			)
		}
		const { directory, ...publishConfig } = source.publishConfig ?? {}
		if (Object.keys(publishConfig).length > 0) manifest.publishConfig = publishConfig
		return manifest as TManifest
	}

	static repositoryUrl(manifest: TManifest): string | undefined {
		const raw = typeof manifest.repository === "string" ? manifest.repository : manifest.repository?.url
		return raw?.replace(PUBLISH_REGEX.GIT_PREFIX, "").replace(PUBLISH_REGEX.GIT_SUFFIX, "")
	}
}

export { ManifestUtils }
