import { match, MatchResult } from './match';
export { match, MatchResult };


namespace dom {
  const dloc = typeof document !== 'undefined' ? document.location : { hash: '' };

  export function readHash(): string {
    // Non-IE browsers return '' when the address bar shows '#'
    // IE returns '#'. Normalize
    const hash = dloc.hash === '#' ? '' : dloc.hash;

    return hash;
  }

  /**
   * Used to track the last value set.
   * if it does not change we ignore events
   */
  let oldHash = readHash();

  export function setHash(hash: string, replace: boolean) {
    if (readHash() === hash) return;

    if (typeof history !== 'undefined' && history.pushState) {
      if (replace) {
        history.replaceState({}, document.title, hash)
      }
      else {
        history.pushState({}, document.title, hash)
      }
    } else {
      dloc.hash = hash;
    }

    oldHash = readHash();
  }

  export function listen(cb: (evt: { oldHash: string, newHash: string }) => void) {

    if (typeof window === 'undefined') return () => null;

    const listener = () => {
      const newHash = readHash();
      if (oldHash === newHash) return;
      cb({ newHash, oldHash });
      oldHash = newHash;
    };

    window.addEventListener('hashchange', listener, false);
    window.addEventListener('popstate', listener);
    return () => {
      window.removeEventListener('hashchange', listener);
      window.removeEventListener('popstate', listener);
    }
  }
}

export interface RouteChangeEvent {
  oldPath: string,
  newPath: string,
}

export type RouteBeforeEnterResult = null | undefined | Promise<{ redirect: string, replace?: boolean }>;
export type RouteEnterResult = void;
/*
 * false means you want to prevent leave
 */
export type RouteBeforeLeaveResult = null | undefined | false | Promise<{ redirect: string, replace?: boolean }>;

export interface RouteConfig {
  /**
   * Called before entering a route. This is your chance to redirect if you want.
   **/
  beforeEnter?: (evt: RouteChangeEvent) => RouteBeforeEnterResult;

  /** 
   * Called on entering a route.
   **/
  enter?: (evt: RouteChangeEvent) => RouteEnterResult;

  /** 
   * On route leave,
   * you can redirect to elsewhere if you want or just return false to prevent leaving
   **/
  beforeLeave?: (evt: RouteChangeEvent) => RouteBeforeLeaveResult;
}

export interface RouterConfig {
  [pattern: string]: RouteConfig;
  /** Common pattern */
  '*'?: RouteConfig;
}

export class Router {
  constructor(public routerConfig: RouterConfig) {
    dom.listen(this.trigger);
  }
  navigate(path: string, replace?: boolean) {
    dom.setHash('#' + path, replace);
  }

  /**
   * Runs through the config and triggers an routes that matches the current path
   */
  async init() {
    return this.trigger({ oldHash: '', newHash: dom.readHash() });
  }
  
  private trigger = async ({ oldHash, newHash }: { oldHash: string, newHash: string }) => {
    const routerConfig = this.routerConfig;

    /** Remove # */
    const oldPath = oldHash.substr(1);
    const newPath = newHash.substr(1);

    const patterns = Object.keys(routerConfig);
    for (const pattern of patterns) {
      const config = routerConfig[pattern];

      /** leaving */
      if (match({ pattern, path: oldPath })) {

        if (config.beforeLeave) {
          const result = await config.beforeLeave({ oldPath, newPath });
          if (result == null) {
            /** nothing to do */
          }
          else if (result === false) {
            dom.setHash(oldHash, true);
            return;
          }
          else if (result.redirect) {
            this.navigate(result.redirect, result.replace);
            return;
          }
        }
      }

      /** entering */
      if (match({ pattern, path: newPath })) {
        /** entering */
        if (config.beforeEnter) {
          const result = await config.beforeEnter({ oldPath, newPath });
          if (result == null) {
            /** nothing to do */
          }
          else if (result.redirect) {
            this.navigate(result.redirect, result.replace);
            return;
          }
        }

        /** enter */
        if (config.enter) {
          const result = await config.enter({ oldPath, newPath });
          return;
        }
      }
    }
  }
}
