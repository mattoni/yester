import { observable, action } from 'mobx';
import { navigate } from './router';
import { links } from './links';


export type Route = 'login' | 'profile';
export class RouteState {
  @observable route: Route = 'login';

  @action setRoute(route: Route) {
    this.route = route;
  }

  @observable loggedIn = false;
  @observable loginRequiredMessage: string = '';
  @action setLoginRequiredMessage(message: string) {
    this.loginRequiredMessage = message;
  }
  @action login() {
    this.loggedIn = true;
    this.loginRequiredMessage = ''
  }
  @action logout() {
    this.loggedIn = false;
    navigate(links.login());
  }

  @observable profileId: string;
  @action setProfile(profileId: string) {
    this.profileId = profileId;
  }
}

export const routeState = new RouteState();