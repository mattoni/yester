import { match, MatchResult, MatchResultParams } from './match';
import { createBrowserHistory, createHashHistory, createMemoryHistory, History, Location } from "history";
export { match, MatchResult, MatchResultParams };


export interface RouteChangeEvent {
  oldPath: string,
  newPath: string,
}

export interface RouteEnterEvent extends RouteChangeEvent {
  params: MatchResultParams,
  search: { [key: string]: string }
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

export interface RouterConfig {
  type: "hash" | "mem" | "browser";
  disableInitialRoute?: boolean;
}

export class Router {
  public readonly history: History;
  constructor(public routes: RouteConfig[], private config: RouterConfig) {
    switch (config.type) {
      case "hash":
        this.history = createHashHistory();
        break;
      case "mem":
        this.history = createMemoryHistory();
        break;
      case "browser":
      default:
        this.history = createBrowserHistory();
        break;
    }
  }

  /**
   * Runs through the config and triggers an routes that matches the current path
   */
  init() {
    let oldPath = this.history.location.pathname;
    this.history.listen((location, action) => {
      this.trigger({
        oldPath,
        newPath: location.pathname,
        search: location.search
      })
      oldPath = location.pathname;
    });

    if (!this.config.disableInitialRoute) {
      return this.trigger({ oldPath: '', newPath: this.history.location.pathname, search: this.history.location.search });
    }
  }

  navigate(path: string, replace?: boolean) {
    if (replace) {
      this.history.replace(path);
      return;
    }

    this.history.push(path);
  }

  handleAnchorClick(e: Event | MouseEvent, replace?: boolean, pathOverride?: string) {
    if (!(e instanceof MouseEvent)) {
      return;
    }
    if (e.which !== 1) {
      return;
    }
    e.preventDefault();
    let p;
    if (e.currentTarget instanceof HTMLAnchorElement) {
      p = e.currentTarget.pathname;
    } else {
      // For use where currentTarget may not be what you expect (i.e. React)
      p = pathOverride;
    }

    if (!p) {
      return;
    }

    this.navigate(p, replace);
  }

  private trigger = async ({ oldPath, newPath, search }: { oldPath: string, newPath: string, search: History.Search }) => {
    const parsedSearch = parseSearchString(search);

    let beforeMatch: RouteConfig | null = null;
    let enterMatch: RouteConfig | null = null;
    let params: MatchResultParams | null = null;

    // pre-parse out matches to make sure they are hit
    for (const config of this.routes) {
      const pattern = config.$;
      const beforePreMatch = match({ pattern, path: oldPath });
      const enterPreMatch = match({ pattern, path: newPath });
      // only use first match and if no remaining path, i.e. full match
      if (!beforeMatch) {
        if (beforePreMatch && !beforePreMatch.remainingPath) {
          beforeMatch = config;
        }
      }

      if (!enterMatch) {
        if (!enterPreMatch || enterPreMatch.remainingPath) {
          continue;
        }

        enterMatch = config;
        params = enterPreMatch.params;
      }
    }
    if (beforeMatch) {
      if (beforeMatch.beforeLeave) {
        const result = await beforeMatch.beforeLeave({ oldPath, newPath });
        if (result == null) {
          /** nothing to do */
        }
        else if (typeof result === 'boolean') {
          if (result === false) {
            this.navigate(oldPath, true);
            return;
          }
          else {
            /** nothing to do */
          }
        }
        else if (result.redirect) {
          this.navigate(result.redirect, result.replace);
          return;
        }
      }
    }

    // No match
    if (!enterMatch || !params) {
      return;
    }

    /** entering */

    /** entering */
    if (enterMatch.beforeEnter) {
      const result = await enterMatch.beforeEnter({ oldPath, newPath, params, search: parsedSearch });
      if (result == null) {
        /** nothing to do */
      }
      else if (result.redirect) {
        this.navigate(result.redirect, result.replace);
        return;
      }
    }

    /** enter */
    if (enterMatch.enter) {
      const result = await enterMatch.enter({ oldPath, newPath, params, search: parsedSearch });
      return;
    }
  }
}

function parseSearchString(query: string) {
  return query
    .replace(/(^\?)/, '')
    .split('&')
    .reduce((obj: { [key: string]: any }, currentPair) => {
      var pair = currentPair.split('=');
      obj[pair[0]] = pair[1];

      return obj;
    }, {});
}
