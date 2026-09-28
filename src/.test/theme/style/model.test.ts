import { describe, it, expect } from 'vitest';
import { ThemeStyle } from '@ts/theme/style/model';
import { CustomPalette } from '@ts/theme/palette/model';

describe('ThemeStyle', () => {
	it('exposes name/slotColors/components as given to the constructor', () => {
		const primary = new CustomPalette('primary', { 50: '#808080' });
		const style = new ThemeStyle('my-style', { primary }, { radius: 4 });
		expect(style.name).toBe('my-style');
		expect(style.slotColors.primary).toBe(primary);
		expect(style.components).toEqual({ radius: 4 });
	});
});
