namespace dom {
  const dloc = document.location;

  export function readHash(): string {
    // Non-IE browsers return '' when the address bar shows '#'
    // IE returns '#'. Normalize
    const hash = dloc.hash === '#' ? '' : dloc.hash;

    return hash;
  }

  export function setHash(hash: string) {
    if (readHash() === hash) return;
    dloc.hash = hash;
  }

  export function listen(cb: (hash: string) => any) {
    const listener = () => {
      cb(readHash());
    };
    window.addEventListener('hashchange', listener, false);
    return () => {
      window.removeEventListener('hashchange', listener);
    }
  }
}

export interface RouteConfig {
  /**
   * Called before entering a route. This is your change to redirect if you want
   **/
  before?: any;
  /** Called if route is finalized */
  on?: any;
}

export interface RouterConfig {
  [key: string]: RouteConfig;
}

export class Router {
  constructor(public config: RouterConfig) {

  }
}