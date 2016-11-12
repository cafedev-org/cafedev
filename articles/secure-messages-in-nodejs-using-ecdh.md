<!--
title=Secure messages in NodeJS using ECDH
author=perry.mitchell
description=Encryption in NodeJS is more straightforward than you might think, and it's an important part of communication between applications sharing private data.
date=2016-11-12 17:02:01
tags=nodejs,encryption,javascript,networking
headerImg=ecdh_cpp.jpg
-->
Part of networking between applications is knowing how to get your data to the other application without it being intercepted. HTTPS is a great example of a widely used protocol utilised for transfer security. Messages are encrypted and securely shared between both parties.

There are a variety of methods, ranging in both difficulty to implement (properly) and secureness, that we could use in a NodeJS application to encrypt messages between applications. Before we dive into one of these, I'd like to mention two players in the crypto game that are often used together, but perform very different operations.

### AES and Diffie-Hellman
[AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) is a data encryption specification that is commonly used to encrypt all sorts of sensitive data. AES has several modes of operation (CBC, CTR, CFB) that can sometimes be more useful in certain use cases. AES allows us to encrypt data using a key (simplified explanation), and to eventually decrypt the same data using the same key.

[Diffie-Hellman](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange) is a **key exchange** method used for securely generating secret keys between 2 parties. Diffie-Hellman (DH) does not perform any encryption, and relies on the 2 parties to share their public keys between each other.

Here's a simple _Alice and Bob_ diagram that should help demonstrate what DH is all about:

![Diffie-Hellman key generation](dh.jpg) 

 1. Alice generates a public/private key-pair using DH
 2. Bob generates his own public/private key-pair using DH
 3. Alice gives her **public** key to Bob (publically visible)
 4. Bob gives his **public** key to Alice (publically visible)
 5. Alice and Bob use each other's public keys with their private keys to generate **secret keys**
 6. Both secret keys are identical

This is what makes DH so special - being able to transfer public keys in _broad daylight_ whilst maintaining security. The secret keys are not visible to anyone other than the two exchanging parties.

### Putting it together
So **AES** requires secret keys to be used to encrypt and decrypt some data, and **DH** is a technique used to generate secret keys that no one else knows about (it is important to remember here that neither one of these tools allows one to verify the other party is who they say they are). Putting them together, DH could be used to generate the secret encryption keys used in AES encryption and decryption. One party (after having their DH key generated) could encrypt (using AES) some message and send it securely to the other party, where they will decrypt it using their secret key (and AES).

### ECDH
Diffie-Hellman comes in another variety: [ECDH](https://en.wikipedia.org/wiki/Elliptic_curve_Diffie%E2%80%93Hellman) (Elliptic-Curve Diffie-Hellman). ECDH simply reduces the computational requirements of the process, and is my choice for demonstration here. You'll most likely find more implementations of ECDH over DH anyhow.

### Practical example
Let's walk through our Alice and Bob example above: We have two parties that want to send some information between each other securely.

Let's build this setup in NodeJS - starting with Alice:

```javascript
const crypto = require("crypto");

let aliceECDH = crypto.createECDH("secp256k1");
aliceECDH.generateKeys();

let alicePublicKey = aliceECDH.getPublicKey(null, "compressed"),
    alicePrivateKey = aliceECDH.getPrivateKey(null, "compressed");

console.log("Alice Public: ", alicePublicKey.length, alicePublicKey.toString("hex"));
console.log("Alice Private:", alicePrivateKey.length, alicePrivateKey.toString("hex"));
```

Now we can repeat the entire process for Bob:

```javascript
let bobECDH = crypto.createECDH("secp256k1");
bobECDH.generateKeys();

let bobPublicKey = bobECDH.getPublicKey(null, "compressed"),
    bobPrivateKey = bobECDH.getPrivateKey(null, "compressed");

console.log("Bob Public:   ", bobPublicKey.length, bobPublicKey.toString("hex"));
console.log("Bob Private:  ", bobPrivateKey.length, bobPrivateKey.toString("hex"));
```

At this stage the keys are swapped, potentially via some request or socket connection. Once both parties have the other's public key, they can generate the secret keys:

```javascript
// On Alice's side
let secret = aliceECDH.computeSecret(bobPublicKey);
console.log("Alice Secret: ", secret.length, secret.toString("hex"));
```

```javascript
// On Bob's side
let secret = bobECDH.computeSecret(alicePublicKey);
console.log("Bob Secret:   ", secret.length, secret.toString("hex"));
```

And you end up with something like the following:

```ini
Alice Public:  33 0220895a53cd561e7cbe490ca6e4aab1c87ea87833f877f1e34fb97e31f68c3b64
Alice Private: 32 f02ffd667a51742f0269a84e5696072ae5c9a5eb6078e7d449a1bf5089bcf41c
Bob Public:    33 02489b117270028ec97730644b636fcf382826feb601bdea5b34d16c1c30319470
Bob Private:   32 7e7ac01d88e427c47ba8bce46c5e87873c9d1d45ce5cb446d4c16a931338e3c6
Alice Secret:  32 984263961d59c9687b14dc60ada7be1b8cab36b7303e4e68f3720e7a71a3c939
Bob Secret:    32 984263961d59c9687b14dc60ada7be1b8cab36b7303e4e68f3720e7a71a3c939
```

_Note that both secret keys are **identical**. Because their private keys were not shared, no one else can generate the same secret keys._

Now that both parties have some secret they can use for encryption, let's get down to sending some secure data. I'll use my own library [iocane](https://github.com/perry-mitchell/iocane) for the encryption/decryption (wrapper for AES). Let's encrypt a message from Alice to Bob:

```javascript
const iocane = require("iocane").crypto;

iocane
    .encryptWithPassword("Hi there, Bob!", secret1)
    .then(function(encrypted) {
        console.log(encrypted);
        // send to Bob
    });
```

You'll get output like the following (Alice's encrypted message to Bob):

```ini
sQ9ZL/azKpMnr8QbBaB8zw==$b2803adc91b3967dfdece4a85e2c7d4d$32066c960381$fc8fd29a3b8a89d2bdc58d0a786b01538f1ddd983d3874e82aa72647e83bd11f$6734
```

After sending it to Bob, he can decrypt it using the same secret key:

```javascript
iocane
    .decryptWithPassword(encrypted, secret1)
    .then(function(message) {
        console.log(message); // "Hi there, Bob!"
    });
```

And there we have it! Secure, encrypted data transfer with key exchanging. I've included the full example below in a single file:

<script src="https://gist.github.com/perry-mitchell/0d4a1da2348eac2bbd9dcd5761c3877c.js"></script>
