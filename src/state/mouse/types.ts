
type TButtons<Buttons extends PropertyKey> = Partial<Record<Buttons, boolean>>

type TMousePosition = {
	x: number,
	y: number,
}

export type {
	TButtons,
	TMousePosition,
}
