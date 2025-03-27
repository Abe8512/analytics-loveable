
// Re-export everything from the individual files
export * from './types';
export * from './store';
export * from './hooks';
export * from './utils';

// For backward compatibility
import { dispatchEvent, addEventListener, removeEventListener } from './store';
import { useEventListener } from './hooks';
import { EVENT_TYPES } from './types';

export { dispatchEvent, addEventListener, removeEventListener, useEventListener, EVENT_TYPES };
