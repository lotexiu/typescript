import { ASearch } from '@ts/a-search/ASearch';
import { SSearch } from '@ts/a-search/SSearch';
import { describe, it } from 'vitest';

describe('Tests with ASearch', () => {
	it('Main', () => {
		const search = new ASearch({
			name: '0(1/1/5)2',
		});
	}),
	it('Nodes', () => {
		const search = new SSearch();
		search.addPatterns({
			name: (p,i) => console.log(`Found ${p} in ${i}`),
			other: (p,i) => console.log(`Found ${p} in ${i}`),
			ot: (p,i) => console.log(`Found ${p} in ${i}`),
			her: (p,i) => console.log(`Found ${p} in ${i}`),
		});
		search.content = '0name1other5';
		search.resolve();
	})
});
