<!--
title=Fixing Javascript's Unicode/Emoji Problem
author=sallar.kaboli
description=Javascript has a huge unicode problem, many have tried to fix it. We'll also try to tackle that using RegExp and look at some other solutions.
date=2016-08-15 18:17:56
tags=javascript,unicode,emoji,nodejs
headerImg=emoji-freaked.jpg
-->
A while ago I needed a simple string pad function, and since it’s a freakishly simple task, I just wrote a simple
function:

```js
function limit(str, limit = 16, padString = "#", padPosition = "right") {
    const strLength = str.length;

    if (strLength > limit) {
        return str.substring(0, limit);
    } else if (strLength < limit) {
        const padRepeats = padString.repeat(limit - strLength);
        return (padPosition === "left") ? padRepeats + str : str + padRepeats;
    }
    return str;
}
```

Pretty simple, right? And it works too... Until you add in an emoji to your text. Then everything falls apart and worlds
collide! How? Simple:

```js
"💩".length // 2!
```

(If you're reading this on Linux you might actually see 2 broken unicode characters, and the result makes sense
unless you have installed an emoji package on your browser or OS)

So how can that be? `String.length` in javascript counts the "code units" in that string, but since Emoji's are new
and their code units aren't known to Javascript, it can't count them correctly. Take it from
[this great article](https://mathiasbynens.be/notes/javascript-unicode):

> Internally, JavaScript represents astral symbols as surrogate pairs, and it exposes the separate surrogate halves as
separate “characters”. If you represent the symbols using nothing but ECMAScript 5-compatible escape sequences, you’ll
see that two escapes are needed for each astral symbol. This is confusing, because humans generally think in terms of
Unicode symbols or graphemes instead.

[Read more here](https://mathiasbynens.be/notes/javascript-unicode).

### Trying to Fix It

ES6 Strings try to solve this problem somehow:

```js
Array.from("💩").length; // 1
```

Yes! As you can see, ES6 recognizes astral symbols correctly... Mostly. If you pass in a "color variation emoji" to
that function this happens:

```js
Array.from("💅🏼"); // ["💅", "🏼"]
```

So again the length will be 2. Because even ES6 doesnt recognize the correct
[surrogate pairs](https://mathiasbynens.be/notes/javascript-encoding#surrogate-pairs).

So after that, I started looking for npm packages that try to fix that problem using Regular Expressions. There are
plently of them available, but after trying them, almost all of them have the same problem as ES6 strings. So
I [submitted](https://github.com/amk221/unicode-string-utils/issues/1)
[a lot](https://github.com/sindresorhus/string-length/issues/1)
[of issues](https://github.com/devongovett/grapheme-breaker/issues/3) on
[Github](https://github.com/essdot/spliddit/issues/9). The only package that did everything correctly was the
awesome [Lodash](https://github.com/lodash/lodash):

```js
_.toArray("💅🏼"); // ["💅🏼"]
```

### The Solution
Since the Lodash package is a bit big in size and I needed a small solution, I borrowed Lodash's complex RegExp and made
my own simple string tools package called: [Stringz](https://github.com/sallar/stringz). It comes with a few helpers to
make unicode string padding and cutting much easier. But obviously, if you already have Lodash installed, go ahead
and use that.

```js
Stringz.limit("👍🏽👍🏽", 4, "👍🏽"); // "👍🏽👍🏽👍🏽👍🏽" 
Stringz.substring("Emojis 👍🏽 are 🍆 poison. 🌮s are bad.", 7, 14); // "👍🏽 are 🍆"
Stringz.length("💅🏼"); // 1
```

[Stringz](https://github.com/sallar/stringz) is released under the MIT License and can be installed using
`npm install stringz`. Thanks to the Lodash RegExp :-)

### Same Issue in The Wild
Many websites that rely on counting input characters get it wrong, including Twitter. Obviously they have tried to
solve the problem but still they have issues with the color variations:

![Twitter](./twitter.jpg)

As you can see, the remaining character count is 136 when it should be 138. Hopefully Twitter fixes this problem so you
can safely tweet 140 colored emojis at once 🙃.
