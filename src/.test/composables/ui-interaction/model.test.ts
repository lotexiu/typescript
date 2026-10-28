import { describe, it, expect } from 'vitest';
import { uiInteraction } from '@ts/composables/ui-interaction/model';

describe('uiInteraction hover', () => {
	it('hover/unhover toggle only the hovered flag', () => {
		const ui = uiInteraction();
		const { flags } = ui.state;
		ui.focus();
		ui.hover();
		expect(ui.state.enabled(flags.hovered, flags.focused)).toBe(true);
		ui.unhover();
		expect(ui.state.enabled(flags.hovered)).toBe(false);
		expect(ui.state.enabled(flags.focused)).toBe(true);
	});
});
