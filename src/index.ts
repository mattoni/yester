import { match, MatchResult } from './match';
export { match, MatchResult };


namespace dom {
  const dloc = document.location;

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
  let lastHash = readHash();

  export function setHash(hash: string, cb: () => void, replace: boolean) {
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

    lastHash = readHash();
    cb();
  }

  export function listen(cb: (hash: string) => any) {
    const listener = () => {
      const newHash = readHash();
      if (lastHash === newHash) return;
      cb(newHash);
      lastHash = newHash;
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

export type RouteBeforeEnterResult = null | undefined | void | Promise<{ redirect: string }>;
export type RouteEnterResult = void;
/*
 * false means you want to prevent leave
 */
export type RouteBeforeLeaveResult = null | undefined | void | false | Promise<{ redirect: string }>;

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
  [key: string]: RouteConfig;
}

export class Router {
  constructor(public config: RouterConfig) {

  }
  navigate(path: string, replace: boolean) {

  }
}