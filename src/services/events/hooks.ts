
import { useEffect } from 'react';
import { addEventListener } from './index';

export const useEventListener = (eventType: string, callback: Function) => {
  useEffect(() => {
    const removeListener = addEventListener(eventType, callback);
    return removeListener;
  }, [eventType, callback]);
};

export default { useEventListener };
