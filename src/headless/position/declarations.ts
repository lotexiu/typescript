import { TSide } from './types';

/**
 * @internal
 */
const OPPOSITE_SIDE: Readonly<Record<TSide, TSide>> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export { OPPOSITE_SIDE };
