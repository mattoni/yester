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

```ts
import {Router} from 'yester';

const router = new Router({
  '/foo' : {
    enter: () => {
      appState.fireTheMissiles();
    }
  }
});

/** If you want to call some `enter` to load the current url hash to your app state */
router.init();

/** To nav. Thinn wrapper on browser hash / pushstate (if supported) */
router.nagivate('/foo');
/** or replace if pushstate is supported, if not its ignored magically */
router.nagivate('/foo', true);
```

