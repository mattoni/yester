import { match, MatchResult, MatchResultParams } from './match';
export { match, MatchResult, MatchResultParams };


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
      /** 
       * Just calling history.pushState() or history.replaceState() won't trigger a popstate event
       */
      fire();
    } else {
      dloc.hash = hash;
    }

    oldHash = readHash();
  }

  /** Current listeners */
  type ChangeEvent = { oldHash: string, newHash: string }
  type Listener = { (evt: ChangeEvent): void }
  let listeners: Listener[] = [];
  const fire = () => {
    const newHash = readHash();
    if (oldHash === newHash) return;
    listeners.forEach(l => l({ oldHash, newHash }));
    oldHash = newHash;
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', fire, false);
    window.addEventListener('popstate', fire);
  }

  export function listen(cb: (evt: { oldHash: string, newHash: string }) => void) {
    listeners.push(cb);
    return () => {
      listeners = listeners.filter(l => l !== cb);
    }
  }
}

export interface RouteChangeEvent {
  oldPath: string,
  newPath: string,
}
export interface RouteEnterEvent extends RouteChangeEvent {
  params: MatchResultParams
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
  beforeEnter?: (evt: RouteEnterEvent) => RouteBeforeEnterResult;

  /** 
   * Called on entering a route.
   **/
  enter?: (evt: RouteEnterEvent) => RouteEnterResult;

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
  init() {
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
      const enterMatch = match({ pattern, path: newPath });
      if (enterMatch) {
        const params = enterMatch.params;

        /** entering */
        if (config.beforeEnter) {
          const result = await config.beforeEnter({ oldPath, newPath, params });
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
          const result = await config.enter({ oldPath, newPath, params });
          return;
        }
      }
    }
  }
}
