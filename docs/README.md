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


