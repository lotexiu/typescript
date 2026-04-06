import { APSearch } from '@ts/a-search/APSearch';
import { SPSearch } from '@ts/a-search/SPSearch';
import { describe, it } from 'vitest';

const content = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Duis accumsan id ligula in fermentum. Nulla nec mi quam.
Aenean nec malesuada eros. Praesent nec suscipit felis, nec fermentum ex.
Nunc leo ipsum, lobortis ut interdum et, facilisis vitae ex.
Curabitur consequat id tortor non faucibus. Vestibulum ultricies felis arcu,
ut pharetra augue volutpat ut.
`

describe('Patterns', () => {
	it('SPSearch (Simple Pattern Search)', () => {
		const search = new SPSearch();
		function onMismatch(s:string, i:number) {console.log(`F - at ${i} for chars: (${JSON.stringify(s)})`)}
		function onMatch(s:string, i:number) {console.log(`T - at ${i} for chars: (${JSON.stringify(s)})`)}

		search.content = content;
		search.onMismatch = onMismatch;
		search.addPatterns({
			Lorem: onMatch,
			la: onMatch,
			lla: onMatch,
			le: onMatch,
			sus: onMatch,
		});
		search.resolve();
	}),

	it('APSearch (Advanced Pattern Search)', () => {
		const search = new APSearch();
		search.addPatterns({
			'0(modifier/content/quantity)2': {
				id: 'test2',
				call: (p,i) => console.log(`Found ${p} in ${i}`),
			},
			'1(1\\/2/3)something': {
				id: 'test1',
				call: (p,i) => console.log(`Found ${p} in ${i}`),
			}
		})
		search.content = content;
		search.resolve();
	})
});
