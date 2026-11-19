type TManifest = Record<string, unknown> & {
	name: string
	version: string
	repository?: string | { url?: string }
	publishConfig?: Record<string, unknown>
}

export type { TManifest }
