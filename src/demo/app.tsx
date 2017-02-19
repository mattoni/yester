/** Normalize JS */
import 'babel-polyfill';
/** Normaize CSS */
import { normalize } from "csstips";
normalize();
import { forceRenderStyles, cssRaw } from 'typestyle';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { routeState } from './routeState';
import { observer } from 'mobx-react';
import { router } from './router';
import { link } from '../index';
import { links } from './links';

/** 
 * Some page CSS customizations.
 * Note: Creating componentized CSS would detract from the points of the demo
 */
cssRaw(`
#root {
  padding: 10px;
}
`);
import { Button, Alert, Vertical, Horizontal, AlertSuccess } from './ui/components';

/**
 * A sample nav
 */
export const Nav = observer(() => {
  return <Vertical>
    {routeState.loggedIn && <Horizontal>
      <a href={link(links.profile('dave'))}>Dave</a>
      <a href={link(links.profile('john'))}>John</a>
    </Horizontal>}

    {routeState.loggedIn && <Button onClick={() => routeState.logout()}>Logout</Button>}

    <Horizontal>
      <a href={'https://github.com/basarat/yester/tree/master/src/demo'} target="_blank">Code for the demo</a>
      <a href={'http://basarat.com/yester'} target="_blank">Yester Docs</a>
      <a href={'https://github.com/basarat/yester'} target="_blank">Star it on github ⭐</a>
    </Horizontal>
  </Vertical>;
});

/**
 * Pages
 */
export const Login = observer(() =>
  <Vertical>
    <h3>Login Page</h3>
    {!routeState.loggedIn && <Button onClick={() => routeState.login()}>Click here to login</Button>}
    {routeState.loggedIn && <AlertSuccess>You are logged in! Visit some profile page :)</AlertSuccess>}
    {routeState.loginRequiredMessage && <Alert>{routeState.loginRequiredMessage}</Alert>}
    <Nav />
  </Vertical>
);

export const Profile = observer(({ profileId }: { profileId: string }) =>
  <Vertical>
    <h3>Profile of : {profileId}</h3>
    <Nav />
  </Vertical>
);



/**
 * Route -> Page
 */
const Page = observer(() => {
  switch (routeState.route) {
    case 'login': return <Login />;
    case 'profile': return <Profile profileId={routeState.profileId} />
    default:
      const _ensure: never = routeState.route;
  }
});

/**
 * Kickoff
 */
ReactDOM.render(<Page />, document.getElementById('root'))
router.init();
forceRenderStyles();

/** Set stateful modules */
import { setStatefulModules } from 'fuse-hmr';
declare var FuseBox: any;
setStatefulModules(FuseBox, ['routeState'])