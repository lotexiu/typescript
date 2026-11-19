const MANIFEST_FIELDS = [
	"name",
	"version",
	"description",
	"keywords",
	"license",
	"author",
	"contributors",
	"repository",
	"homepage",
	"bugs",
	"funding",
	"type",
	"sideEffects",
	"engines",
	"dependencies",
	"peerDependencies",
	"peerDependenciesMeta",
	"optionalDependencies",
] as const

const ENTRY_FIELDS = ["main", "module", "types", "typings", "exports", "bin"] as const

const DEPENDENCY_FIELDS = ["dependencies", "peerDependencies", "optionalDependencies"] as const

const DIST_DIRECTORY = "dist"

const DIST_PREFIX = "./dist/"

const WORKSPACE_PROTOCOL = "workspace:"

const DEFAULT_BRANCH = "master"

const PUBLISH_REGEX = {
	MARKDOWN_LINK: new RegExp("\\]\\((?!https?:|#|mailto:)([^)\\s]+)\\)", "g"),
	GIT_SUFFIX: new RegExp("\\.git$"),
	GIT_PREFIX: new RegExp("^git\\+"),
	LEADING_DOT_SLASH: new RegExp("^\\./"),
	TABLE_PIPE: new RegExp("\\|", "g"),
	WHITESPACE_RUNS: new RegExp("\\s+", "g"),
}

export { MANIFEST_FIELDS, ENTRY_FIELDS, DEPENDENCY_FIELDS, DIST_DIRECTORY, DIST_PREFIX, WORKSPACE_PROTOCOL, DEFAULT_BRANCH, PUBLISH_REGEX }
