import { match, MatchResult, MatchResultParams } from './match';
import { createBrowserHistory, createHashHistory, createMemoryHistory, History } from "history";
export { match, MatchResult, MatchResultParams };

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

export interface RouterConfig {
  type: "hash" | "mem" | "browser";
}

export class Router {
  private history: History;
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
    this.history.listen((location, action) => {
      this.trigger({ oldPath: '', newPath: location.pathname, search: location.search })
    });
    return this.trigger({ oldPath: '', newPath: this.history.location.pathname, search: this.history.location.search });
  }

  navigate(path: string, replace?: boolean) {
    if (replace) {
      this.history.replace(path);
      return;
    }

    this.history.push(path);
  }

  private trigger = async ({ oldPath, newPath, search }: { oldPath: string, newPath: string, search: History.Search }) => {
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

      /** entering */
      const enterMatch = match({ pattern, path: newPath });
      if (enterMatch) {
        if (enterMatch.remainingPath) {
          continue;
        }

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

