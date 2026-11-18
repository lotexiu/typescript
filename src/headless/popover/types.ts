import { TDialogOptions } from '../dialog/types';
import { TPositionOptions } from '../position/types';

/** Options of a `Popover`: dialog options plus positioning. */
type TPopoverOptions = TDialogOptions & TPositionOptions;

export type { TPopoverOptions };
