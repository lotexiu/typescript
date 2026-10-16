import { bitFlag, BitFlag } from '../bit-flag/model';

type UIInteraction = {
	state: BitFlag<'focused' | 'hovered' | 'active'>;
	blur: () => void;
	focus: () => void;
	active: () => void;
	unactive: () => void;
};
const UIInteraction = {
	[Symbol.hasInstance](instance: any): instance is UIInteraction {
		return instance.blur === UIInteraction.blur;
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

const { blur, focus, active, unactive } = UIInteraction;
function uiInteraction() {
	const flags = bitFlag('focused', 'hovered', 'active');
	const instance = {} as UIInteraction;
	instance.state = flags;
	instance.blur = blur;
	instance.focus = focus;
	instance.active = active;
	instance.unactive = unactive;
	return instance;
}

export { UIInteraction, uiInteraction };
