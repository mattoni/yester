import { Router } from '../index';
import { routeState } from './routeState';
import { links } from './links';

export const router = new Router([
  {
    $: links.login(),
    enter: () => routeState.setRoute('login')
  },
  {
    $: links.profile(':profileId'),
    enter: ({ params: { profileId } }) => {
      routeState.setRoute('profile');
      routeState.setProfile(profileId);
    },
    beforeEnter: () => {
      if (!routeState.loggedIn) {
        routeState.setLoginRequiredMessage('You need to login before you can visit a profile page');
        return { redirect: links.login() };
      }
    },
  },
  { $: '*', enter: () => routeState.setRoute('login') },
]);
