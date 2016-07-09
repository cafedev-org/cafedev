<!--
title=Visual regression testing: it's not about being pixel-perfect
author=perry.mitchell
description=Visual regression testing covers more important aspects of quality assurance than just detecting minute changes in colours and positions of UI components
date=2016-07-08 20:18:57
tags=regression,testing,javascript,nodejs
headerImg=visual-regression.jpg
-->
Visual regression occurs when parts of a UI change, even slightly, to a state that was unintended by both developers and designers. It occurs everywhere, and at least every front-end developer has to deal with this on a very regular basis.

Regression of UI components can be painful as even a pixel shift in any direction or a colour off by just a few units is undesirable and can set-back releases and delay deadlines. Many have covered visual regression and have noted how easy regression detection software makes detecting these minute changes.

There's a neat npm package called [image-diff](https://www.npmjs.com/package/image-diff) which calculates the differences between an image and a control to see if they differ in any way.

The difference of the following two images:

![images to diff](diff1.jpg)

![difference](diff1-diff.jpg)

Libraries like this make it easy to detect differences in images, and can be adapted to help difference UI components when using tools like [Selenium Webdriver](https://www.npmjs.com/package/selenium-webdriver) to take screenshots of loaded components and pages.

When a component misaligns or changes colour/font etc., it's quite easy to identify that something went wrong during the testing phase before release. What's more important, in my opinion, is the fact that visual regression helps catch much larger issues, like completely missing or broken components.

Take the following bar of buttons, for instance:

![component with buttons](buttons.jpg)

If something broke during the build process of your component or application, and the last button disappeared, then the user experience could be affected. Not everyone has time to test each and every piece of UI through integration tests or other means, but using visual regression means that we'd catch cases like this by default:

![buttons difference](buttons-diff.jpg)

Testing individual components is a more robust approach to visual regression testing rather than diff'ing an entire webpage screenshot, but if it's easier to do the latter it's definitely a step up from your regular test strategies.

Static pages can be automatically tested by pointing Webdriver to them once they're in staging or production so defects can be found without user interaction.

Regression testing basic components and pages makes sense, but try not to go overboard with the suite of items you test against. It's easy to get carried away and just make headaches for you and your team. Remember that non-safe iframes won't render when taking _screenshots_ from within the page context, but will when using Webdriver.

There are already some mostly-complete visual regression testing suites available, like [SC5](https://sc5.io/)'s [Gulp visualtest](https://www.npmjs.com/package/sc5-styleguide-visualtest):

![visualtest by SC5](sc5-visualtest.jpg)

Be wary of margins and padding, and have fun.
