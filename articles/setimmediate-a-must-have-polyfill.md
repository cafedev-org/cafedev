<!--
title=setImmediate: a must-have polyfill
author=perry.mitchell
description=setImmediate offers, in most cases, unparalleled performance for asynchronous scheduling of functions, and is drastically underused in the wild.
date=2016-07-06 23:16:59
tags=async,promise,javascript,performance,polyfill
headerImg=lightning.jpg
-->
`setTimeout` and `setInterval` are two highly used asynchronous methods available in JavaScript that help schedule function execution. Few people are aware that there was almost a third method in this timing group, called [`setImmediate`](https://developer.mozilla.org/en/docs/Web/API/Window/setImmediate).

`setImmediate` fires a callback method in another execution context, but with a higher priority than that of `setTimeout` or `setInterval` with a delay time of `0`. `setImmediate` was proposed by Microsoft and was first implemented in Internet Explorer 10. It's also [available in NodeJS](https://nodejs.org/api/timers.html#timers_setimmediate_callback_arg), but not any other browsers. The native (IE) `setImmediate` [is a long way ahead of other timers in terms of performance](https://developer.microsoft.com/en-us/microsoft-edge/testdrive/demos/setimmediatesorting/):

[![JavaScript yielding with timers and setTimeout](yielding.jpg)](yielding.jpg)

When calling `setImmediate`, no delay time is necessary:

```js
setTimeout(myFunction, 0);

setImmediate(myFunction);
```

`setImmediate` calls take a higher priority over `setTimeout`, so it's ideal to use in performance critical callback scheduling. Several of the better [Promise polyfills](https://github.com/taylorhakes/promise-polyfill) use `setImmediate` for their callback scheduling:

```js
// Use polyfill for setImmediate for performance gains
var asap = (typeof setImmediate === 'function' && setImmediate) ||
  function (fn) {
    setTimeoutFunc(fn, 0);
  };
```

Being that `setImmediate` is not supported by any other browser other than Internet Explorer, you need to use [a polyfill](https://github.com/YuzuJS/setImmediate). The polyfill has some interesting methods at its disposal to mimic the high-priority nature of its native counterpart:

 * `process.nextTick()` - When running under Node, YuzuJS' `setImmediate` can use the built-in `nextTick` method to emulate the function
 * `window.postMessage()` - Browsers don't usually have the `process` global, so the `postMessage` is the most commonly used polyfill for `setImmediate`. Window messages have a very high priority callback status, so they're quite ideal for this purpose, but there are a number of caveats here which will be mentioned later.
 * `MessageChannel` - Browsers that support MessageChannels can polyfill `setImmediate` by creating 2 dummy channels and firing an event (message) from one to the other.
 * `onreadystatechange()` - Older browsers that don't support the above methods will use the `onreadystatechange` callback for new scripts being executed.
 * `setTimeout` - If none of the above are supported (why would we want to run here?), `setTimeout(fn, 0)` can be used as a low-performance alternative.

As a high-performance async tool, `setImmediate` is a great addition to certain applications. In some cases it could be seen as a somewhat aggressive tactic to callbacks, as (for instance) the `postMessage` implementation will take priority over all timeouts initiated by calls to `setTimeout`. Other JavaScript applications will have less processing time when a script using setImmediate is making repeated calls using the `postMessage` implementation.
