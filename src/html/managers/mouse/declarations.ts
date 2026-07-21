
/** Maps `MouseEvent.button` numeric codes to their named `mouseManager` button values. */
const MOUSE_BUTTON_MAP = {
	0: "MouseLeft",
	1: "MouseMiddle",
	2: "MouseRight",
	3: "MouseBack",
	4: "MouseForward",
} as const;

export {
	MOUSE_BUTTON_MAP,
}