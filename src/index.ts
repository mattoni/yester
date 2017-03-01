import { match, MatchResult, MatchResultParams } from './match';
export { match, MatchResult, MatchResultParams };


namespace dom {
  const dloc = typeof document !== 'undefined' ? document.location : { hash: '' };

  export function readHash(): string {
    // When the address bar shows '#'
    // - Non-IE browsers return '' 
    // - IE returns '#'
    // Normalize to ''
    const hash = dloc.hash === '#' ? '' : dloc.hash;

    // For empty path we should return `#/`
    // This keeps the matching algorithm consistent and simple
    if (hash === '') return '#/';

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

export type RouteBeforeEnterResult = void | null | undefined | { redirect: string, replace?: boolean } | Promise<{ redirect: string, replace?: boolean }>;
export type RouteEnterResult = void;
/*
 * false means you want to prevent leave
 */
export type RouteBeforeLeaveResult = void | null | undefined | boolean | Promise<boolean> | { redirect: string, replace?: boolean } | Promise<{ redirect: string, replace?: boolean }>;

export interface RouteConfig {
  /**
   * The pattern to match against
   */
  $: string;

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


export class Router {
  constructor(public routes: RouteConfig[]) {
    dom.listen(this.trigger);
  }

  /**
   * Runs through the config and triggers an routes that matches the current path
   */
  init() {
    return this.trigger({ oldHash: '', newHash: dom.readHash() });
  }

  private trigger = async ({ oldHash, newHash }: { oldHash: string, newHash: string }) => {
    /** Remove `#`` */
    const oldPath = oldHash.substr(1);
    const newPath = newHash.substr(1);

    for (const config of this.routes) {
      const pattern = config.$;

      /** leaving */
      if (match({ pattern, path: oldPath })) {

        if (config.beforeLeave) {
          const result = await config.beforeLeave({ oldPath, newPath });
          if (result == null) {
            /** nothing to do */
          }
          else if (typeof result === 'boolean') {
            if (result === false) {
              dom.setHash(oldHash, true);
              return;
            }
            else {
              /** nothing to do */
            }
          }
          else if (result.redirect) {
            navigate(result.redirect, result.replace);
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
            navigate(result.redirect, result.replace);
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


/**
 * Navigates to the given path
 */
export function navigate(path: string, replace?: boolean) {
  dom.setHash(`#${path}`, !!replace);
}

/**
 * Gives you a link that when triggered, navigates to the given path
 */
export function link(path: string) {
  return `#${path}`;
}
