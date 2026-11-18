import { TDiagnostic } from "@ts/language/types"

type TDocTag = { name: string; value?: string }

type TDoc = { description: string; tags: TDocTag[] }

type TMemberKind = "constructor" | "method" | "property" | "getter" | "setter" | "enumMember"

type TMember = {
	name: string
	kind: TMemberKind
	signature: string
	isStatic: boolean
	line: number
	doc?: TDoc
}

type TDeclaration = {
	name: string
	kind: string
	exported: boolean
	internal: boolean
	line: number
	signature: string
	overloads?: string[]
	members: TMember[]
	doc?: TDoc
}

type TGlobalAugmentation = {
	target: string
	name: string
	line: number
	members: TMember[]
}

type TFileDoc = {
	path: string
	declarations: TDeclaration[]
	globals: TGlobalAugmentation[]
	sideEffect: boolean
	exportOrder: string[]
	diagnostics: TDiagnostic[]
}

export type { TDocTag, TDoc, TMemberKind, TMember, TDeclaration, TGlobalAugmentation, TFileDoc }
