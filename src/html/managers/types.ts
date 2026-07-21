/** Current value alongside the value it transitioned from — the shape every manager's live state snapshot follows. */
type TState<T> = {
	current: T,
	previous: T,
}

export {
	TState,
}