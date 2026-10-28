import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { TTicker, TTickerOptions } from './types';

/** A timer as state: `count` goes up by one every `interval` ms while running — clocks, progress bars, polling. */
function ticker(interval: number, options: TTickerOptions = {}): TTicker {
	const count = signal(0);
	const running = signal(false);
	let handle: ReturnType<typeof setInterval> | undefined;

	function start() {
		if (handle !== undefined) return;
		handle = setInterval(() => count.update((value) => value + 1), interval);
		running.set(true);
	}

	function stop() {
		if (handle === undefined) return;
		clearInterval(handle);
		handle = undefined;
		running.set(false);
	}

	const instance: TTicker = {
		count: computed(() => count()),
		running: computed(() => running()),
		start,
		stop,
		reset: () => count.set(0),
		dispose: () => {
			stop();
			count.dispose();
			running.dispose();
		},
	};
	if (options.autoStart) start();
	return instance;
}

export { ticker };
