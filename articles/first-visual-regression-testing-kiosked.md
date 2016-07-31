<!--
title=First visual regression testing at Kiosked with GUIRE
author=perry.mitchell
description=Kiosked's adtech being tested for visual regression using GUIRE for NodeJS
date=2016-07-27 20:51:04
tags=regression,testing,javascript,nodejs
headerImg=pattern.jpg
-->
Front-end ad-tech is primarily about getting network placements in front of users as quickly as possible, but there are some important UI aspects to consider when testing. Obviously ads need to be able to close using some kind of close button, and may include some other information or logo regarding the ad or its provider. The placement itself, with its shape and size, could also be considered an important part of its user interface.

By considering what makes up an ad placement visually, or what makes up any component visually, we can identify the parts of our application that should be scrutinised during testing as if they were to change, our application may no longer perform its duty. A lot of my job at [Kiosked](http://www.kiosked.com/) is making sure our ads remain consistent across sites and devices by developing cross-platform code, but every developer in this area knows that consistency is one of the most difficult ideals to uphold during continuous integration.

QAs and good testing routines can catch most regression, but those edge-cases where either a component is a pixel off or even not there at all can be easily caught by using automated testing software. Integration tests can help a lot for complex scenarios, but the boilerplate code that usually comes with them make them hard to maintain and unwieldy.

My team and I have thought a lot about these aspects of our codebase, and because it's constantly changing and being upgraded to outperform the competition, we've avoided any testing practices that could potentially slow down our development speed and reduce our ability to pivot portions of the codebase. If we're going to cover that next base by adding visual regression tests into the mix, those tests need to be simple and versatile so occasional maintenance is not a massive headache.

We released [GUIRE](https://www.npmjs.com/package/@kiosked/guire) very recently and are now starting to make it an integral part of our front-end test suite. GUIRE configurations are pretty simple:

```js
const path = require("path");

let testURL = path.resolve("./index.html");

module.exports = {
    name: "test-name",
    url: `file://${testURL}`,
    waitForEl: "#myApp",
    components: [
        {
            name: "component-test-1",
            setupFn: function(done) {
                window.Library.initSomething.then(done);
            }
        }
    ]
};
```

Each section (whatever you decide this should be) of your app gets a test suite like this, and is then made up of components. For each suite GUIRE creates and launches a [WebdriverJS](https://www.npmjs.com/package/selenium-webdriver) instance to perform a clean set of tests within. Once launched and ready (determined by checking **waitForEl** or **setupFn**), GUIRE executes each component test in that session before recording the results and closing the Webdriver instance.

### Using GUIRE to test components
There are a number of different ways to setup tests with GUIRE, but the testing engine basically only needs 2 things: a JavaScript suite configuration and a page to execute the tests on.

[This example](https://github.com/perry-mitchell/guire-example) demonstrates how a component built with Webpack may be tested, though real-world cases may prove to be more complex:

```js
module.exports = {
    name: "MyComponent",
    url: testURL,
    setupFn: setupFunction,
    components: [
        {
            name: "MyComponent-test-1"
        }
    ]
};
```

The **url** must be either a file URL (eg. "file:///index.html") or HTTP-served URL. Webpack makes it easy to generate static files to test, but setting up the `setupFn` to prepare the page for injecting the script can become quite cumbersome:

```js
let setupFunction = `var callback = arguments[arguments.length - 1];
let s = document.createElement("script");
s.src = "${bundleURL}";
document.body.appendChild(s);
setTimeout(callback, 1500);
`;
```

All-in-all running a local server and testing the page via that may be the easier option. This functionality may find its way into GUIRE [at some stage](https://github.com/Kiosked/guire/issues/4) quite soon, as configuration files are best left simple and descriptive.

GUIRE's Webdriver integration launches Chrome by default to render the test page:

![GUIRE rendering with WebdriverJS](guire-render.jpg)

If you're testing different facets of a component or different components themselves, you can use the `setupFn` function on each component definition to hide all others and initialise the next item to test. Utility methods like `beforeEach` and `afterEach` will also [soon become available](https://github.com/Kiosked/guire/issues/5) for GUIRE.

### Using GUIRE on a CI server
If you're serious about project stability you're probably running a CI server. As Webdriver supports testing in real browsers, running GUIRE tests on a headless server can sometimes be tricky. Checkout GUIRE's [Travis configuration](https://github.com/Kiosked/guire/blob/master/.travis.yml) to see how it uses [X virtual framebuffer](https://en.wikipedia.org/wiki/Xvfb) (XVFB) to run Firefox and Chrome tests without a typical window manager. There's even a [plugin for Jenkins](https://wiki.jenkins-ci.org/display/JENKINS/Xvfb+Plugin).
