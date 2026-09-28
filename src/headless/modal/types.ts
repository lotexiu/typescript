import { Computed } from '@tsr-node/computed/model';
import { Signal } from '@tsr-node/signal/model';
import { TReactive } from '@tsr-node/types';

type TModalCloseReason = 'backdrop' | 'escape' | 'action' | 'programmatic';

type TModalConfig = {
	closeOnBackdrop?: boolean;
	/** Return `false` to veto the close (e.g. unsaved changes). */
	beforeClose?: (reason: TModalCloseReason) => boolean | void;
	/** Delay (ms) before `contentVisible` turns false after closing, to let an exit transition play. Default `0`. */
	exitDelay?: TReactive<number> | number;
};

type TModal = {
	open: Computed<boolean>;
	/**
	 * True as soon as `show()` runs; only turns false `exitDelay` ms after closing. Bind the
	 * content's mount/unmount to this, not `open`, when the modal animates out.
	 */
	contentVisible: Signal<boolean>;
	closeOnBackdrop: Signal<boolean>;
	show(): void;
	/** Runs `beforeClose(reason)` first — a `false` return vetoes the close. Returns whether it actually closed. */
	requestClose(reason?: TModalCloseReason): boolean;
};

export type { TModalCloseReason, TModalConfig, TModal };
