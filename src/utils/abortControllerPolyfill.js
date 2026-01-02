/**
 * AbortController Polyfill for Sketch
 *
 * Sketch's JavaScript environment doesn't include AbortController,
 * so we provide a minimal polyfill that supports the basic functionality
 * needed for request timeouts.
 */

if (typeof AbortController === 'undefined') {
  global.AbortController = class AbortController {
    constructor() {
      this.signal = {
        aborted: false,
        addEventListener: (type, handler) => {
          if (type === 'abort') {
            this.signal._abortHandler = handler;
          }
        },
        removeEventListener: (type, handler) => {
          if (type === 'abort' && this.signal._abortHandler === handler) {
            this.signal._abortHandler = null;
          }
        }
      };
    }

    abort() {
      this.signal.aborted = true;
      if (this.signal._abortHandler) {
        this.signal._abortHandler({ type: 'abort' });
      }
    }
  };

  global.AbortSignal = class AbortSignal {
    constructor() {
      this.aborted = false;
    }
  };
}
