<!--
title=Script error from Chrome with Karma and Webdriver
author=perry.mitchell
description=Chrome will sometimes throw a mysterious 'script error' when catching global errors in Karma tests or Webdriver instances
date=2016-08-04 19:49:20
tags=testing,javascript,development,bugs
headerImg=chrome-error.jpg
-->
Chrome is a funny beast, but it makes for a great testing or execution target when using tools like [Karma](https://karma-runner.github.io/1.0/index.html) or [Webdriver](https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs). Karma allows for catching global _uncaught_ exceptions, but writing something yourself is quite straightforward:

```js
function handleError(err) {
    console.log("Caught the error:", err);
}

// Maybe:
window.addEventListener("error", handleError, false);
// Or possibly:
window.onerror = (msg, url, line, col, error) => handleError(error || new Error(msg));
// Or even:
window.addEventListener("unhandledrejection", function(event) {
    // event is a PromiseRejectionEvent
    handleError(event);
}, false);
```

_Global error handling is basically a **nightmare**_.

All this trouble to end up with something like this:

```
Error: Script error
```

![Jackie Chan WTF](jackie-wtf.jpg)

Thanks Chrome. So it turns out that this is actually to do with [security](http://stackoverflow.com/a/7778424/966338), and can occur when running local (localhost) scripts and resources. I encountered it first in [JasDriver](https://github.com/perry-mitchell/jasdriver), which uses Webdriver. The fix was to add the `--allow-file-access-from-files` [Chrome flag](https://github.com/perry-mitchell/jasdriver/blob/4ea9248cd992357de517eceb5c18e5417b8db50d/source/index.js#L55):

```js
let webdriverCapabilities = Webdriver.Capabilities.chrome();
webdriverCapabilities.set('chromeOptions', {
    'args': ["--allow-file-access-from-files"]
});

webdriver = (new Webdriver.Builder())
    .withCapabilities(webdriverCapabilities)
    .build();
```

The second encounter was with Karma runner in a project at work, and involved an update to our Karma config:

```js
{
    // snip

    browsers: ["ChromeWithoutWebSecurity"],

    customLaunchers: {
        ChromeWithoutWebSecurity: {
            base: 'Chrome',
            flags: ['--disable-web-security']
        }
    }

    // snip
}
```

These flags are obviously fine for testing purposes, and make our errors a little easier to read. Chrome will stop feeding us cryptic `"Script error"` messages and we can get on with our work.
