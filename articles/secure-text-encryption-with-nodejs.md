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

> While [Buttercup][1] was in development, the text encryption functionality was split out into a new library called [iocane][2]. iocane performs highly-secure text encryption with authentication, and implements all of the concepts discussed in this article.

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

Although using [Crypto's][11] `pbkdf2` method, I'd recommend using a third-party wrapper like [pbkdf2 on npm][4]. pbkdf2 provides a neat wrapper that also supports synchronous usage: `pbkd2f.pbkdf2Sync('password', 'salt', 1, 32, 'sha512')`.

With your derived key, we can now proceed to the fun part: encryption.

## Encrypting text
There are many different flavours of data encryption, but we'll be looking at one of the most common: AES CBC. [AES][5] [Cipher-Block-Chaining][6] is perhaps one of the most well-known and widely used forms of encryption as it is both secure and widely supported (in terms of platforms).

There are actually many different forms of AES (as well as other ciphers), though I'd recommend sticking with one that boasts a wide range of support across operating systems. For instance, [Buttercup][1] was intended to be multi-platform, so its cipher system would have to be compatible with most common operating systems. [AES-GCM][12] was originally considered, but as iOS didn't support it, the [implementation was switched to use CBC][7].

Creating your own cipher can be fun and highly educational, but is very often strongly discouraged.. and for good reason. Encryption algorithms are highly complex and take a long time to reach widespread usage as they're tested and vetted for security and robustness. Your own personal cipher would most likely not receive the level of scrutiny required to assure anyone that it is both safe and relatively future-proof.

Let's dive in to actually encrypting something with AES-CBC in Node - we just need to consider a few parameters:

 * IV - An initialisation vector
 * Password
 * Salt
 * Key
 * HMAC - Authentication hash
 * Text

We have some text to encrypt, and we already looked at the password, randomly generated salt and the key, but what about the IV and HMAC? An initialisation vector enables the cipher to uniquely generate the first block of cipher text, which in turn helps to uniquely generate the next (and so on):

![initialisation vector](cbc-encryption.png)

IVs are required for the use of CBC mode encryption and decryption, and it's best if they're completely random. Both IVs and salts can be stored with the resulting encrypted content, so they can be collected and easily used during the decryption process.

A [HMAC][8] is a _message authentication_ technique, designed to help ensure that the encrypted content cannot be tampered with without knowing about it during an attempted decryption. It's a hash applied to the final encrypted content, and usually includes the salt and IV. This hash allows the decrypter to verify that the contents of the package were not changed since encryption.

Modes like GCM do not need a HMAC, as their authentication mechanism is built into the cipher process. NodeJS supports GCM-mode AES encryption, though (as mentioned before) many other platforms do not.

Say we have our key:

```js
let key = pbkdf2Sync(password, salt, numberOfRounds, bits, "sha256"),
    hmac;
// HMAC is taken from the key in our case (see iocane)
```

We can generate an IV like so:

```js
let iv = new Buffer(crypto.randomBytes(16)),
    ivHex = iv.toString("hex");
```

And finally perform our encryption (the HMAC we used came from our key derivation procedure, [as with iocane][9]):

```js
let encryptTool = crypto.createCipheriv("aes-256-cbc", key, iv),
    hmacTool = crypto.createHmac("sha256", hmac),
    saltHex = salt.toString("hex");
// Now encrypt
let encryptedContent = encryptTool.update(text, "utf8", "base64");
encryptedContent += encryptTool.final("base64");
// Generate HMAC
hmacTool.update(encryptedContent);
hmacTool.update(ivHex);
hmacTool.update(saltHex);
let hmacHex = hmacTool.digest("hex");
```

When storing or transferring the content, handling the payload is made easier by joining and splitting the data:

```js
let package = [encryptedContent, ivHex, saltHex, hmacHex, numberOfRounds].join("$");
```

The process to perform secure text encryption is quite straightforward and easily abstracted away into simple helper functions. [iocane][2] is a Node package designed to provide this simple interface in a basic & easy-to-use API. It performs the encryption and packaging like I've discussed here. [iocane's decryption][10] is just as simple.

Don't be afraid of encryption - there's a wealth of tools and experience out there to help you secure your content.

[1]: https://github.com/buttercup-pw/buttercup "Buttercup"
[2]: https://github.com/perry-mitchell/iocane "iocane"
[3]: https://en.wikipedia.org/wiki/Key_derivation_function "Key derivation function"
[4]: https://www.npmjs.com/package/pbkdf2 "PBKDF2 on npm"
[5]: https://en.wikipedia.org/wiki/Advanced_Encryption_Standard "The AES encryption standard"
[6]: https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation "Cipher-Block-Chaining"
[7]: https://github.com/perry-mitchell/iocane/blob/master/source/crypto.js#L18 "iocane encryption tool"
[8]: https://en.wikipedia.org/wiki/Hash-based_message_authentication_code "HMAC message authentication"
[9]: https://github.com/perry-mitchell/iocane/blob/master/source/derive.js#L63 "Key & HMAC in iocane"
[10]: https://github.com/perry-mitchell/iocane/blob/master/source/crypto.js#L50 "iocane decryption"
[11]: https://nodejs.org/api/crypto.html "NodeJS's Crypto"
[12]: https://en.wikipedia.org/wiki/Galois/Counter_Mode "AES GCM"
