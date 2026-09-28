import { Timeout } from '@tsn-class/declarations';
import { computed } from '@tsr-node/computed/model';
import { signal } from '@tsr-node/signal/model';
import { toggle } from '@tsr/toggle/model';
import { TModal, TModalCloseReason, TModalConfig } from './types';

function modal(config: TModalConfig = {}): TModal {
	const { closeOnBackdrop: initialCloseOnBackdrop = true, beforeClose, exitDelay = 0 } = config;

	const state = toggle(false);
	const closeOnBackdrop = signal(initialCloseOnBackdrop);
	const contentVisible = signal(false);
	let hideHandle: Timeout | undefined;

	// Opening shows content immediately; closing keeps it mounted for `exitDelay` so an exit
	// transition can play, and re-opening before that delay elapses cancels the pending hide.
	state.subscribe((isOpen) => {
		if (hideHandle !== undefined) clearTimeout(hideHandle);
		if (isOpen) {
			contentVisible.set(true);
			return;
		}
		const ms = typeof exitDelay === 'number' ? exitDelay : exitDelay();
		if (ms <= 0) {
			contentVisible.set(false);
			return;
		}
		hideHandle = setTimeout(() => contentVisible.set(false), ms);
	});

	function show(): void {
		state.on();
	}

	function requestClose(reason: TModalCloseReason = 'programmatic'): boolean {
		if (beforeClose?.(reason) === false) return false;
		state.off();
		return true;
	}

	return {
		open: computed(() => state()),
		contentVisible,
		closeOnBackdrop,
		show,
		requestClose,
	};
}

export { modal };
