import { bitFlag, BitFlag } from '../bit-flag/model';

/** Hover, focus and active flags of an element, kept in one `BitFlag`. */
type UIInteraction = {
	/** The flags. */
	state: BitFlag<'focused' | 'hovered' | 'active'>;
	/** Pointer entered. */
	hover: () => void;
	/** Pointer left. */
	unhover: () => void;
	/** Focus left (also ends active). */
	blur: () => void;
	/** Got focus. */
	focus: () => void;
	/** Pressed (also focused). */
	active: () => void;
	/** Released. */
	unactive: () => void;
};
/** Methods shared by every instance (assigned to each one) and the `instanceof` check. */
const UIInteraction = {
	[Symbol.hasInstance](instance: any): instance is UIInteraction {
		return instance.blur === UIInteraction.blur;
	},

	hover(this: UIInteraction) {
		const { state } = this;
		state.enable(state.flags.hovered);
	},

	unhover(this: UIInteraction) {
		const { state } = this;
		state.disable(state.flags.hovered);
	},

	blur(this: UIInteraction) {
		const { state } = this;
		state.disable(state.flags.focused, state.flags.active);
	},

	focus(this: UIInteraction) {
		const { state } = this;
		state.enable(state.flags.focused);
	},

	active(this: UIInteraction) {
		const { state } = this;
		state.enable(state.flags.focused, state.flags.active);
	},

	unactive(this: UIInteraction) {
		const { state } = this;
		state.disable(state.flags.active);
	},
};

const { hover, unhover, blur, focus, active, unactive } = UIInteraction;
/** Creates a `UIInteraction` with every flag off. */
function uiInteraction() {
	const flags = bitFlag('focused', 'hovered', 'active');
	const instance = {} as UIInteraction;
	instance.state = flags;
	instance.hover = hover;
	instance.unhover = unhover;
	instance.blur = blur;
	instance.focus = focus;
	instance.active = active;
	instance.unactive = unactive;
	return instance;
}

export { UIInteraction, uiInteraction };
