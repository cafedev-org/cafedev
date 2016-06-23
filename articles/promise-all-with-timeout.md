<!--
author=perry.mitchell
date=2016-06-23 21:32:31
title=Promise~all with a timeout
description=JavaScript's Promise.all that waits a specified amount of time before resolving
headerImg=countdown.jpg
tags=javascript,promise,async
-->
JavaScript's Promises are a powerful deferred-result processing tool that have changed the way developers tackle asynchronicity in today's applications. The standard Promise implementation in browsers and NodeJS uses a few simple features to revolutionise how asynchronous methods are called and their results handled.

Take, for instance, a very common example of why Promises are so cool:

```js
// Using callbacks:
doThisFirst(function(err, data1) {
    if (err) {
        // handle error
    }
    doThisSecond(function(err, data2) {
        if (err) {
            // handle error
        }
        doThisThird(function(err, data3) {
            if (err) {
                // handle error
            }
        });
    });
});

// Using promises:
doThisFirst()
    .then(doThisSecond)
    .then(doThisThird)
    .catch(function(err) {
        // handle error
    });
```

By now everyone should have seen examples similar to this being thrown around. A feature of Promises that is slightly less thrashed in examples is `Promise.all()`, which takes an array of _Promises_ and resolves with an array of their results or throws a `.catch`-able exception:

```js
Promise
    .all([
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3)
    ])
    .then(res => res.join(", "))
    .then(str => { console.log(str); }); // 1, 2, 3
```

`Promise.all()` makes fetching data from multiple remotes at the same time a breeze, and what you get back is an array of all the data you need for your application - but what if you didn't want to wait for each endpoint to respond, and instead didn't care if all the data came back or not?

Say you had a specified amount of time you needed to wait, and no more, for all responses to return. `.all` comes close to helping here, but it provides no native way of specifying a timeout (as Promises don't work that way).

With some small amount of wrapper code, we can imitate `Promise.all()` and provide a way to specify a maximum time in milliseconds for the Promises to resolve:

<script src="https://gist.github.com/perry-mitchell/dfe8becce634689206725af318b44445.js"></script>

This `promiseAllTimeout` method takes an array just like `Promise.all`, but it accepts 2 more parameters:

 * A maximum wait time in milliseconds. This is approximate as timeouts in JavaScript are rarely spot-on.
 * A flag to specify the behaviour. If set to `true` (default), the function will resolve when the time expires even if not all Promises have resolved by that time - in this case, unresolved Promises will map to `undefined`. If set to `false`, if any Promises did not resolve by the time specified an exception is thrown.

This is definitely not a suitable replacement for the built-in method, but it does provide a handy interface for working with time-sensitive components.
