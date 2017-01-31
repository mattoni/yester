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

export interface RouteChangeEvent {
  oldPath: string,
  newPath: string,
}

export type RouteBeforeResult = null | undefined | void | Promise<{ redirect: string }>;
export type RouteEnterResult = void;
/*
 * false means you want to prevent leave
 */
export type RouteLeaveResult = null | undefined | void | false | Promise<{ redirect: string }>;

export interface RouteConfig {
  /**
   * Called before entering a route. This is your chance to redirect if you want.
   **/
  before?: (evt: RouteChangeEvent) => RouteBeforeResult;

  /** 
   * Called on entering a route.
   **/
  enter?: (evt: RouteChangeEvent) => RouteEnterResult;

  /** 
   * On route leave.
   **/
  leave?: (evt: RouteChangeEvent) => void;
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