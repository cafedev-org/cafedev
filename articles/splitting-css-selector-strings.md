<!--
title=Splitting CSS selectors (for use with MutationObserver)
author=perry.mitchell
description=Using css-selector-splitter, CSS selector strings can be split into their separate components (multiple selectors and relationship components) (covers usage with MutationObserver)
date=2016-08-23 18:20:01
tags=css,javascript,tools
headerImg=split-boulder.jpg
-->
CSS selectors are versatile query strings that browsers can use to locate elements according to many various aspects. Selectors can be used to locate elements that have a certain relationship with their parents, children and siblings, certain attributes or values and even certain states (radio buttons etc.). Selector query strings can also contain multiple selectors separated by commas.

A lot of how the front-end software at Kiosked works is to do with these query strings, as they help make the product more dynamic by allowing us to specify elements to interact with at runtime. As browser technology has progressed, we've frequently upgraded our interaction mechanisms to more powerful and efficient alternatives. One such upgrade was the use of the [MutationObserver API](https://developer.mozilla.org/en/docs/Web/API/MutationObserver), which allows us to subscribe to DOM alteration notifications. This has a huge advantage over other methods like intervals as we only need to react to changes rather than check for them in an infinite loop.

MutationObservers are very powerful, but we're interested in elements strewn about the DOM so it can't exactly help us narrow down exactly what we want to listen to. We have our CSS selectors, but listening to only the changes relevant to those selectors is a challenge.

Let's take a look at a query selector: `article.content div.main > p.article, div.sidebar span.header ~ span.info`. There's a lot going on here, but when it boils down to it, there's only a couple of selectors that really tell us what elements are being selected: `p` and `span.info`. Of course the context matters here, but when using something like a MutationObserver to pump hundreds or thousands of notifications into our hands about changes, it's probably OK to check their location later once we've determined they're at least the right element we care about.

We need to first break this selector up into useful peaces before we can begin to use it with a MutationObserver, and [css-selector-splitter](https://github.com/perry-mitchell/css-selector-splitter) is a library that can assist with this. Using css-selector-splitter we can first break up the selector into its 2 sub-selectors:

```js
const splitSelector = require("css-selector-splitter");

let selectors = splitSelector("article.content div.main > p.article, div.sidebar span.header ~ span.info");
console.log(selectors); // ["article.content div.main > p.article", "div.sidebar span.header ~ span.info"]
```

Now that we have our selectors split, we can think about what we really need to make the MutationObserver more useful. What we really care about are the actual selected elements, as the MutationObserver will only give us those. `p.article` and `span.info` hold enough information to allow us to narrow down our search through the waves of potential notifications. We can split these selectors further:

```js
selectors.forEach(function(selector) {
    let breakup = splitSelector.splitSelectorBlocks(selector),
        mostImportantPart = breakup.selectors.pop();
    console.log(mostImportantPart); // "p.article", "span.info"
});
```

Now that we have this information, we can extract the necessary parts we need to identify any interesting elements that come through the observer. Let's start with taking out the necessary information:

```js
var mostImportantPart = "p.article",
    classes = [],
    ids = [];
var match,
    regex = new RegExp("(\\.|#)(\\w+)", "g");
while (match = regex.exec(mostImportantPart)) {
    if (match[1] === "#") {
        ids.push(match[2]);
    } else if (match[1] === ".") {
        classes.push(match[2]);
    }
}
console.log(classes); // ["article"]
```

And with this, we can start watching for new nodes:

```js
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var obs = new MutationObserver(function(mutations, observer) {
    // look through all mutations that just occured
    for (var i = 0; i < mutations.length; i += 1) {
        // look through all added nodes of this mutation
        for (var j = 0; j < mutations[i].addedNodes.length; j += 1) {
            var node = mutations[i].addedNodes[j],
                nodeClasses = (node.className || "").split(/\s+/g),
                nodeID = node.id || "",
                interesting = false;
            for (var k = 0; k < classes.length; k += 1) {
                if (nodeClasses.indexOf(classes[k]) >= 0) {
                    interesting = true;
                    break;
                }
            }
            if (ids.indexOf(nodeID) >= 0) {
                interesting = true;
            }
            if (interesting) {
                // do something with node
            }
        }
    }
});

obs.observe(document.body, {
    childList: true,    // addition and removal of elements
    subtree: true       // target and target's descendants
});
```

Once we've defined our callback for the observer, be can begin observing within an element by calling `observe(element, options)`. `options` defines what information we're interested in hearing about, whilst `element` is the parent that we're listening within. Let's generate some elements to listen for:

```js
var mainDiv = document.querySelector("div.main");
[
    "test",
    "article",
    "other"
].forEach(function(elClass) {
    var el = document.createElement("p");
    el.className = elClass;
    mainDiv.appendChild(el);
});
```

As we're only listening for the `article` class, only one of these should appear as _interesting_ in our code above.

Mutation observers are highly powerful and quite efficient, and can make very versatile tools when coupled with the right application design. CSS selectors can be an easy way of representing important information - and with css-selector-splitter, they can be broken up into components that can be used with MutationObserver as well as other tools.
