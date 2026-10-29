import { describe, it, expect } from 'vitest';
import { uiInteraction } from '@ts/composables/ui-interaction/model';

describe('uiInteraction hover', () => {
	it('hover/unhover toggle only the hovered flag', () => {
		const interaction = uiInteraction();
		const { flags } = interaction.state;
		interaction.focus();
		interaction.hover();
		expect(interaction.state.enabled(flags.hovered, flags.focused)).toBe(true);
		interaction.unhover();
		expect(interaction.state.enabled(flags.hovered)).toBe(false);
		expect(interaction.state.enabled(flags.focused)).toBe(true);
	});
});
