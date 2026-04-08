type NavigateAwayFn = (action: () => void) => void;

let _handler: NavigateAwayFn | null = null;

export const navigationGuard = {
  register(fn: NavigateAwayFn) {
    _handler = fn;
  },
  unregister() {
    _handler = null;
  },
  /** Runs action through the active guard if one exists, otherwise runs action directly. */
  navigate(action: () => void) {
    if (_handler) {
      _handler(action);
    } else {
      action();
    }
  },
};
