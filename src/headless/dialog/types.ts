import { TControlOptions } from '../control/types';
import { LayerStack } from '../layer/model';

/** Why an overlay is being closed by the user. */
type TDismissReason = 'escape' | 'outside' | 'close';

/** Options of a `Dialog`. */
type TDialogOptions = TControlOptions<boolean> & {
	/** Blocks the rest of the page (`aria-modal`). Default `true` for `Dialog`, `false` for `Popover`. */
	readonly modal?: boolean;
	/** `'alertdialog'` for confirmations that interrupt the user. Default `'dialog'`. */
	readonly role?: 'dialog' | 'alertdialog';
	/** Default `true`. */
	readonly closeOnEscape?: boolean;
	/** Default `true` for non-modal overlays, `false` for modal dialogs. */
	readonly closeOnOutside?: boolean;
	/** Stack used to decide which overlay is on top. Default `LayerStack.shared`. */
	readonly layers?: LayerStack;
};

export type { TDismissReason, TDialogOptions };
