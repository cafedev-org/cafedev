<!--
title=Custom HTML elements and better ads
author=perry.mitchell
description=A little experimentation with registering custom HTML elements and how it could be applied to design better digital ads.
date=2016-10-04 23:14:34
tags=dom,javascript
headerImg=tetris.jpg
-->
So, **custom elements** is a thing and we can begin looking at how browsers are going to support it going forward. Custom elements are exciting because they allow for great extensibility and better expression of structure and behaviour. I won't dive into what custom elements are, as many have done this before I, but if you want to catch up on what [custom elements](https://www.html5rocks.com/en/tutorials/webcomponents/customelements/) are, there's plenty to find about them on the Googles.

_Be aware that there are 2 versions of the "spec": v0 and v1. Tutorials and documentation will cover one or the other mostly._

While v0 has more support across browsers, it still doesn't look so great:

[![custom elements v0 browser support](custom-elements-v0.jpg)](http://caniuse.com/#search=custom%20elements)

[v1](http://caniuse.com/#feat=custom-elementsv1) looks even worse.

While custom elements lacks sufficient support for widespread use, the ideas that can be accurately expressed using a custom data structure and behaviour don't have to be ignored. One such idea that I've had is the **improvement of online ads** through creating elements designed for the very specific purpose of displaying ads to a user.

Here's a ground-level stab at expressing, with custom elements, what a custom ad implementation might look like:

```html
<i-ad 
  data-creative="http://ad-server.com/banner/728x90.png"
  data-click="https://publisher.org/promotion/"
  data-cb-passback="_ad01_callback"></i-ad>
```

Without going into too much detail, we could probably agree that online ads have some basic things in common:

 * A **creative** to show to the user
 * A **click** event or target (URL or Javascript event)

What all ads **should** have in common, in my opinion, is a universal **passback** method. Having been developing in the adtech world for some time now it's very frustrating working with various networks and their distinct lack of API support. Having some agreed-upon way of signalling a lack of _fill_ and allowing integrated platforms to perform their own passback functions would revolutionise dynamic ad placements.

My example code includes `data-cb-passback`, which is designed to hold the name of a global passback function on the `window`. When the ad passes-back due to lack of demand, the function will be executed.

The `<i-ad></i-ad>` syntax looks pretty neat, right? It's very expressive, and allows us to define some custom functionality:

```js
var IAdPrototype = Object.create(HTMLElement.prototype);

/**
 * Initialise a passback
 */
IAdPrototype.passback = function() {
    if (this.hasPassbacked) {
        return;
    }
    this.hasPassbacked = true;
    var cbName = this.dataset.cbPassback;
    if (cbName && window[cbName]) {
        window[cbName](this);
    }
};

/**
 * On-created callback
 */
IAdPrototype.createdCallback = function() {
    var shadow = this.createShadowRoot();

    // If we have a creative
    if (this.dataset.creative) {
        var img = document.createElement("img");
        img.src = this.dataset.creative;
        img.width = 728;
        img.height = 90;
        shadow.appendChild(img);
    }

    // If the 'click' attribute exists
    if (this.dataset.click) {
        this.style.cursor = "pointer";
        this.addEventListener("click", function(e) {
            e.preventDefault();
            // Open the URL
            window.open(this.dataset.click);
        }, false);
    }
};

var IAd = document.registerElement("i-ad", {
    prototype: IAdPrototype
});
```

So we create an extension of the `HTMLElement` object, attach a `createdCallback` to fire when when an `IAd` is instantiated or located in the DOM, and register it on the `document`.

Our `<i-ad>` tag will then render the creative in a shadow root and attaches a click listener. If the ad passes back, we could simply add functionality to take the value of `this.dataset.cbPassback`, find it on the window and execute its function.

This example illustrates a basic implementation with a single custom element, but we could be even more expressive:

```html
<i-ad>
    <i-ad-creative>
        <a href="http://somewhere.com">
            <img src="ad.jpg" />
        </a>
    </i-ad-creative>
    <i-ad-pixel data-event="viewed" data-amount="100%" href="http://ad-server.com/ping/?e=viewed&a=100&id=123" />
    <i-ad-pixel data-event="viewed" data-amount="50%" href="http://ad-server.com/ping/?e=viewed&a=50&id=123" />
    <i-ad-pixel data-event="clicked" data-href="http://ad-server.com/ping/?e=clicked&id=123" />
    <i-ad-passback data-callback="_ad01_callback" />
</i-ad>
```

There are endless iterations available with custom elements, but I feel that the support limitation is what's holding back a more global implementation and possibly a standard.

There are some sacrificies that could be made to better todays ads in plain old HTML5 that's supported in most current browsers, but I'll touch on this next time.
