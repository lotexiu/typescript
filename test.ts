import './src/index';
import { computed, model, variant, ValueHistory, StopWatch } from './src/index';

function section(title: string) {
	console.log(`\n=== ${title} ===`);
}

// --- Model ---
section('Model');
const m = model(1);
m.subscribe((value) => console.log('model changed:', value));
m.set(2);
m.set(2); // no-op, Object.is dedup, should not log
m.update((v) => v + 10);
console.log('model value:', m.value);

// --- Computed ---
section('Computed');
const c = computed(() => m.value * 2, [m]);
console.log('computed initial:', c.value);
c.subscribe((value) => console.log('computed changed, prevValue:', value.prevValue));
m.set(5);
console.log('computed after m.set(5):', c.value);

// --- Computed dispose ---
section('Computed dispose');
const shared = model(1);
let notifyCount = 0;
const derived = computed(() => shared.value * 10, [shared]);
derived.subscribe(() => notifyCount++);
shared.set(2);
console.log('notifyCount after 1 change (subscribed):', notifyCount, 'value:', derived.value);
derived.dispose();
shared.set(3);
console.log('notifyCount after dispose + change (should be unchanged):', notifyCount);
console.log('derived.value after dispose (stale, last computed):', derived.value);
console.log('shared listeners size after dispose (should be 0, internal check via re-subscribe):', (() => {
	// dependency itself keeps working fine independent of the disposed computed
	let sharedNotified = false;
	const unsub = shared.subscribe(() => sharedNotified = true);
	shared.set(4);
	unsub();
	return sharedNotified;
})());

// --- Variant ---
section('Variant');
const v = variant((key: 'a' | 'b') => key === 'a' ? 'Alpha' : 'Beta', 'a' as 'a' | 'b');
console.log('variant initial:', v.key, v.value);
v.subscribe((variantInstance) => console.log('variant changed:', variantInstance.prevKey, '->', variantInstance.key, '=', variantInstance.value));
v.set('b');
console.log('variant after set(b):', v.key, v.value, 'prevKey:', v.prevKey, 'prevValue:', v.prevValue);
v.set('b'); // same key, should not notify

// --- ValueHistory ---
section('ValueHistory');
const history = new ValueHistory<number>(3); // cacheSize 3
history.add(1);
history.add(2);
history.add(3);
history.add(4); // exceeds cacheSize, should evict oldest
console.log('history:', history.history.value);
console.log('current:', history.current.value);
history.undo();
console.log('after undo, current:', history.current.value, 'previous:', history.previous.value, 'next:', history.next.value);
history.redo();
console.log('after redo, current:', history.current.value);

// --- StopWatch ---
section('StopWatch');
const sw = new StopWatch();
sw.totalLaps.set(3);
sw.start();
setTimeout(() => {
	sw.lap();
	console.log('lap 1 recorded, laps:', sw.laps.value);
	setTimeout(() => {
		sw.lap();
		console.log('lap 2 recorded, laps:', sw.laps.value);
		console.log('duration:', sw.duration.value);
		console.log('average:', sw.avarage.value);
		console.log('estimated remaining:', sw.estimated.value);
	}, 20);
}, 20);
