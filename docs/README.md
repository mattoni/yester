> Client side routing so simple that you will fall in love ❤️

<iframe src="https://ghbtns.com/github-btn.html?user=basarat&repo=yester&type=star&count=true" frameborder="0" scrolling="0" width="170px" height="20px"></iframe>

> [Powered by your github ⭐s](https://github.com/basarat/yester/stargazers).

Uni directional data flow is the best data flow: 

![](https://raw.githubusercontent.com/basarat/yester/master/docs/uni-directional.png)

Saw the other solutions out there, they had two differnce of opinions

* This is build in TypeScript, for TypeScript. Other libraries [will get there eventually](http://staltz.com/all-js-libraries-should-be-authored-in-typescript.html). Till then fighting with out-of-date type definitions was not fun (because the original documentation gets out of date just as quickly as it gets written, can't blame type def authors as they work off these out of date docs).
* They encourage tangling routing with components. This can be a good idea, but any time I needed more power, I had to do things like wrap my component (which may or may not work with TS classes), imagine props getting passed magically (not very type safe) and jump other hoops like `next` and `done` callbacks.

If existing solutions work well for you (`npm install foo foo-bar @types/foo @types/foo-bar`) *thats okay*. You can move on and live a happy life yet 🌹

## What does it support

Simple `#/foo` = on match > (`beforeEnter` `enter` `beforeLeave`) management. That's all I really needed. You can map `url` => `state` => `any arbitrary nesting of components` very easily and more maintainably in the long term instead of depending on hidden features of some library.

## Install 

```
npm install yester --save
```

## Quick 

```js
import {Router} from 'yester';

const router = new Router({
  '/foo' : {
    enter: () => {
      appState.fireTheMissiles();
    }
  }
});

/** 
 * If you want to trigger some `beforeEnter` / `enter` (if it matches)
 */
router.init();

/** To nav. Thinn wrapper on browser hash / pushstate (if supported) */
router.nagivate('/foo');
/** or replace if pushstate is supported, if not its ignored magically */
router.nagivate('/foo', true);
```

## Matching 

### Parameters

Support `:param` for loading sections e.g

```js
'/foo/:bar' : {
  enter: ({params}) => {
    console.log(params); // {bar:'somebar'} 🍻
  }
}

// User visits `/foo/somebar`
```
You can have as my params as you want e.g. `/foo/:bar/:baz`.

### Optional

Wrap any section with `()` to mark it as optional. e.g `/foo(/bar)`. In this case both `/foo` and `/foo/bar` match. To escape a `(` you can use a backslash e.g. `/foo\\(\\)` will only match the url `/foo()`.

### Wild card

`*` will match entire sections e.g. `/foo/*` will match `/foo/whatever/you/can/think/of`. The last matched `*` is placed in `params.splat`.

### Wild card greedy

`*` does not match greedily e.g. 

* `/*/c` does not match `/you/are/cool/c` as a single star only eats `/*/cool/c` and the trailing `ool/c` is unmatchd.

If you want such matching use the greedy `**` wildcard e.g.

* `/**/c` matches `/you/are/cool/c`. 

> The difference between `**` vs. `*` is only really evident when you want to match something inside i.e. `/*/c` (inside) vs. `/c/*` (end). In an end position they both behave the same.

## Handlers 

You can specify `beforeEnter`, `enter`, `beforeLeave` handlers. (Of course, you have TypeScript to guide you).

> Path: if `window.location.hash`:`#/foo`, in our lingo `path` is `/foo`.

Example of all these handlers: 

```js
'/foo/' : {
  beforeEnter: ({oldPath, newPath, params}) => void | Promise<{ redirect: string, replace?: boolean }>,
  enter: ({oldPath, newPath, params}) => void,
  beforeLeave: ({oldPath, newPath}): void | false | Promise<{ redirect: string, replace?: boolean }>,
}
```

Lets look at these one by one.

### `beforeEnter` 
Triggered before calling `enter`. This is your chance to go ahead and redirect the user if you want (e.g. if they are not logged in), just return `Promise.resolve({redirect:'/newPath'})`.

### `enter`
Yay, they made it. Use the oldPath, newPath, params to your hearts content.

### `beforeLeave`
The are about to leave. If the `newPath` is not something you like, you can go ahead and return `false` to prevent them moving (be sure to let them know why by adding some notification to your state/UI). You can even go ahead and chose to redirect them elsewhere.

## Lazy loading
Just use the JavaScript patterns you know and love e.g. with webpack.

```js
'/foo/' : {
  enter: () => { 
    require.ensure(['banana','monkey-holding-the-banana','the-jungle'], ()=>{
      // your app logic
    });
  }
```

## Uni-Directional

Now that we have the entire simple API covered, let's talk a bit more about patterns (🕊️ and 🐝). The simplest way to do it is simply to follow the `url -> state -> view` pattern. You can use something like `mobx` or `redux` for `state -> view` pattern. 

* Browser's back / next buttons, or clicking on any link that changes the url will automatically trigger an event we already register to and we map them to the hooks as need. You don't need to do anything here.
* Users actions like a `goToPayment()` action can follow the same pattern as the user clicking the link by simply calling `router.navigate('/payment')` (we just use pushstate or hash change based on detected browser support).

Sweet, its all `url => someHookYouUseToChangeState` ❤️️.
