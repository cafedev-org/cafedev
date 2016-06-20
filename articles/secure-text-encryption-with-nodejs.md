<!--
author=perry.mitchell
date=2016-06-20 21:50:49
title=Secure Text Encryption With NodeJS
description=Securely encrypt and decrypt text using NodeJS
headerImg=window-drops.jpg
tags=nodejs,javascript,encryption
-->
When it comes to protecting electronic information, encryption is paramount. Whether it's sending secret messages from peer to peer or client to server, or just storing sensitive data locally, encrypting the information before sending/storing it can protect the data so that only the intended parties can read it.

NodeJS excels at basic encryption techniques and provides a comprehensive built-in API for performing encryption, decryption, key derivation and various other encoding actions. Let's get into the basics of text encryption and how we can achieve a simple yet decent implementation in NodeJS.

> While developing [Buttercup][1], I split the text encryption functionality out into a new library called [iocane][2]. iocane performs highly-secure text encryption with authentication, and implements all of the concepts discussed in this article.

What facilitates successful encryption and decryption is a key - a key is a piece of information that controls the encryption and decryption process (along with other components). It is arguably the most important piece of unique information provided during the encryption procedure. A key is usually _derived_ from a password and a random set of characters (called a salt), and is of a set length (usually a hash like SHA-256 etc.) so that it works well with encryption algorithms.

The [derivation process][3] involves the password and random salt being processed in such a way that a hash is generated to represent the data. The processing of the hash occurs in a **round**, and there are usually many tens or hundreds of thousands of rounds in a single derived password. The derivation process is mathematically complex and so takes some time to produce a result - this time delay adds to the security of the encryption/decryption procedure as it would take time for an attacker to process the key from a password in the same manner.

Deriving a key in Node is quite straightforward:
```js
const crypto = require("crypto");
const ITERATIONS = 1000;
const BYTES = 32;

crypto.pbkdf2("some text", "abc123-salt", ITERATIONS, BYTES, function(err, derivedKey) {
    if (err) {
        // handle the error
    } else {
        var hexEncodedKey = new Buffer(derivedKey).toString('hex');
        // do something with the key
    }
});
```

Although using Crypto's `pbkdf2` method, I'd recommend using a third-party wrapper like [pbkdf2 on npm][4]. pbkdf2 provides a neat wrapper that also supports synchronous usage: `pbkd2f.pbkdf2Sync('password', 'salt', 1, 32, 'sha512')`.

With your derived key, we can now proceed to the fun part: encryption.

[1]: https://github.com/buttercup-pw/buttercup "Buttercup"
[2]: https://github.com/perry-mitchell/iocane "iocane"
[3]: https://en.wikipedia.org/wiki/Key_derivation_function "Key derivation function"
[4]: https://www.npmjs.com/package/pbkdf2 "PBKDF2 on npm"
