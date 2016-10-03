<!--
title=Iterating over HTML node siblings
author=perry.mitchell
description=What might seem like a basic task to iterate over the siblings of an element on a page can turn out to be quite a challenge - there are plenty of unforeseen element types and states to consider
date=2016-10-03 23:16:07
tags=javascript,dom
headerImg=html-stylised.jpg
-->
The DOM is **great** because navigating around it is a piece of cake. Browsers give you a huge array of tools for finding your way around, including helping you locate those nodes (elements) that you're after.

Libraries like jQuery have done their part in attempting to straighten the learning curve for front-end developers, but the average use-case (well hell, **most use-cases**) of a new site or application don't need functionality beyond what the built-ins can provide.

Getting to the point - once you have an element in your hand (variable), you can quite easily navigate around that element (no need to perform query after query). Say you have an `<li>...</li>` - the `li`'s element object has a number of methods to assist your perusal of the nearby DOM (inherited from [`Node`](https://developer.mozilla.org/en-US/docs/Web/API/Node#Properties)).

Some such methods are `previousSibling` and `nextSibling`. Once again, these guys are from the `Node` level and will point to `Node`s, not elements, so be careful handling the objects you find (no two DOMs are the same). For instance `myLI.nextSibling` might return something like:

![text](nextSibling.png)

This `#text` object is not your average element, obviously:

```js
nextNode instanceof HTMLElement;    // false
nextNode instanceof Text;           // true
```

Checking for these guys can be tricky, and `instanceof` [isn't the best](http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/) overall, but there is a much neater and more robust way: `nextNode.nodeType` holds the numerical identity of the DOM node:

![node type](nodeType.png)

There are also other types of nodes out there that don't behave like elements, so make sure to account for them correctly:

```js
function isComment(node) {
    return node.nodeType ===  Node.COMMENT_NODE;
}

function isText(node) {
    return node.nodeType === Node.TEXT_NODE;
}
```

If you're crawling part of the DOM collecting text, for instance, then detecting text nodes may be the right way to go. In newer browsers however it is possible to skip non-element nodes completely by using `element.nextElementSibling` and `element.previousElementSibling` (these only return the next and previous elements and no other node types).

Explaination by example: Here's a `getPlainText` implementation that scrapes text from a DOM element using `node.childNodes` and `node.nodeValue`. Given the following DOM:

![example DOM html](dom-example.jpg)

You could write the `getPlainText` scraper like so:

```js
function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}

function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE;
}

function stripWhitespace(text) {
    return text
        .replace(/\t/g, " ")
        .replace(/\n/g, " ")
        .replace(/[ ]{2,}/g, " ");
}

function getPlainText(node) {
    var target = node.cloneNode(true),
        text = "";
    if (isTextNode(target)) {
        text += target.nodeValue.replace(/<br>/gi, "\n");
    } else if (isElementNode(target)) {
        text += Array.prototype.slice.call(target.childNodes || [])
            .map(getPlainText)
            .join(" ");
    }
    return stripWhitespace(text.trim());
}

var target = document.getElementById("target"),
    text = getPlainText(target);

console.log(text);
```

Which would output:

> "My heading Some starting text. Some text node content. Some sub content. End text."

Notice the `Array.prototype.slice` call? Some low-level calls return `NodeList`s, which don't work exactly like arrays. Using `slice` we can convert them back to an array for easy manipulation.

Don't be afraid of working with raw elements and nodes - their interfaces are quite intuitive!
