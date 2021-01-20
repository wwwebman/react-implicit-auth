import mitt from 'mitt';

import type { AdapterEmitter } from './types';

/**
 * @see https://github.com/developit/mitt
 * @see https://github.com/developit/mitt#usage
 */
const createEmitter = (): AdapterEmitter => mitt();

export default createEmitter;
