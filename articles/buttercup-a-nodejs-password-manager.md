<!--
title=Buttercup - A NodeJS password manager
author=perry.mitchell
description=NodeJS is a fantastic platform for application development, and provides a strong base to build Buttercup on - An open-source password archive manager.
date=2016-10-23 17:15:02
tags=buttercup,nodejs,javascript,encryption,oss
headerImg=buttercup.jpg
-->
After several attempts at building a password manager I liked in C#, I switched to NodeJS as the platform of choice for Buttercup. The Node application was designed to cover several points that were the reason I wanted out of using platforms like LastPass, KeePass etc.:

 * I want to host the archive myself, wherever I want. It should be accessible from all of my devices.
 * I don't want to pay for an account or hosting.
 * I want the same application experience on every platform.
 * I want save-conflict resolution support, if I forget to close and save changes on another device.
 * I want strong encryption but a lightweight file size.

[Sallar](https://github.com/sallar) and [myself](https://github.com/perry-mitchell) started building Buttercup in [September 2015](https://github.com/buttercup-pw/buttercup-core/commit/69be24bcd698c762378c14f5aa466057a96c7d12#diff-04c6e90faac2675aa89e2176d2eec7d8R1) and since then I feel we can say that we've addressed almost all of those points (except for the _every platform_ bit - that's work-in-progress). There's so much going on, but it definitely feels like we're going in the right direction. It's still early days, but our intended offering is going to be very broad.

### Components
Buttercup, the system, is made up of several components ([repositories](https://github.com/buttercup-pw) and [npm packages](https://www.npmjs.com/browse/keyword/buttercup)):

 * [The core](https://github.com/buttercup-pw/buttercup-core) - Responsible for the archive structure, functionality, encryption, saving and loading. It manages the conflict resolution and delta history flattening for archive optimisation.
 * [The desktop GUI](https://github.com/buttercup-pw/buttercup) - The beautiful user interface for PCs running Windows, Mac or Linux. Built on electron, it gives us complete control over its behaviour and design while remaining highly portable.
 * [The core, for the web](https://github.com/buttercup-pw/buttercup-core-web) - The core library, compiled and minified for use in browsers. 
 * Browser plugins - Currently only an [extension for Chrome](https://github.com/perry-mitchell/buttercup-chrome) is in the works, but Firefox and Safari will also be among the earliest supported browsers.
 * [The CLI](https://github.com/buttercup-pw/buttercup-cli) - A command-line application for interacting with archives in the terminal.
 * [The server](https://github.com/buttercup-pw/buttercup-server) - A server application designed to host and provide an interface for user accounts and archives.

![Buttercup flier](buttercup-paper.jpg)

#### Buttercup desktop application
The desktop application was built with [Electron](http://electron.atom.io/) and makes use of the core library. It provides an interface for users to interact with their archives, no matter where they're stored. Each remote interface (_currently only files in the first version_) will be supported on every platform possible.

As work continues on the next version of the GUI, the first version is quite complete and shows the simplicity of working with our password manager:

![Buttercup GUI v1](gui-v1.jpg)

#### Buttercup core library
The core library is responsible for the secure archive handling functionality used by all other applications.

```js
const Buttercup = require("buttercup");
```

The internals of the library are sophisticated and complex at times, but the external API remains quite simple and easy to grasp.

Buttercup provides an `Archive` object which represents exactly what you think it does - a password archive, running in memory.

```js
const { Archive } = Buttercup;

let myArchive = new Archive(),
    myGroup = myArchive.createGroup("My group");
```

An archive contains groups and entries to help organise credentials. Groups can be nested, and entries are stored in groups. An `Entry` represents a login or credential for a system.

```js
let myLogin = myGroup.createEntry("Some website");
myLogin
    .setProperty("username", "person123")
    .setProperty("password", "xyz123$")
    .setMeta("url", "http://website.com/login.php");
```

Archives can be saved to a destination using a `Datasource`. The basic ones are `TextDatasource` (output to a string) and `FileDatasource` (output to a local file), but there are also remote ones like [`OwnCloudDatasource`](https://github.com/buttercup-pw/buttercup-core/blob/master/doc/api.md#OwnCloudDatasource) and [`ButtercupServerDatasource`](https://github.com/buttercup-pw/buttercup-core/blob/master/doc/api.md#buttercupserverdatasource). One might want to save an archive to their [OwnCloud](https://owncloud.org/) file hosting, for example.

```js
const { OwnCloudDatasource } = Buttercup;

let datasource = new OwnCloudDatasource(
    "https://my-server.org",
    "/security/buttercup-archive.bcup",
    "ownCloudUsername",
    "pass12345"
);

// `.save` returns a Promise
datasource.save(myArchive, "myMasterPassword!");
```

Buttercup keeps a history of _commands_ run against the archive each time a change is made:

```txt
cmm "Buttercup archive created (2016-10-22)"
fmt "buttercup/a"
cgr 0 a021e761-a8e2-4344-8901-cd9719f8e90d
tgr a021e761-a8e2-4344-8901-cd9719f8e90d "test-group-main"
pad 75ec23b6-2501-4a60-aed6-e52851f63514
cen a021e761-a8e2-4344-8901-cd9719f8e90d 7b88ff33-16d6-47ee-bac2-92ec8673b29f
sep 7b88ff33-16d6-47ee-bac2-92ec8673b29f title "test-entry-main"
pad c15b15c2-e265-4be4-83ef-875a1a2b11f6
sep 7b88ff33-16d6-47ee-bac2-92ec8673b29f username "user123\@test.@D"
pad 4d1a0ecf-ce41-4f21-8bbd-e27a32f44981
sep 7b88ff33-16d6-47ee-bac2-92ec8673b29f password "* ª¾¸¯¼¾°Í¡! "
pad aff747d7-3131-4322-a79b-69cc5458036c
sem 7b88ff33-16d6-47ee-bac2-92ec8673b29f "test-meta" "test-value 8"
pad fb9b6251-2c87-4d80-84b1-6a97e28c7e79
```

Buttercup recognises these commands and makes modifications to the object in memory. When **saving**, the core encrypts and gzips the history before storing it using a `Datasource`. These commands allows Buttercup to mitigate conflicts when saving buy finding a **common base** between two conflicting archive histories and zipping them together from that point onwards. That means that if two instances of the same archive are left open and saved at the same time, the differences between them are not lost. [Deletion actions are cancelled in the case of a merge](https://github.com/buttercup-pw/buttercup-core/blob/1558eabe1e1bf4c36a0a6612fa57c336a4b528df/source/classes/Workspace.js#L123), but this allows the user to retain all of their credential information.

Because juggling an archive and its datasource while trying to perform conflict detection and merging could be considered a complicated task, there's a handy class called `Workspace` that's designed to make this process easier.

```js
const { Workspace } = Buttercup;

let workspace = new Workspace();
workspace
    .setArchive(myArchive)
    .setDatasource(datasource)
    .setPassword(masterPassword);

workspace
    .archiveDiffersFromDatasource()
    .then(function(differs) {
        if (differs) {
            return workspace.mergeFromDatasource();
        }
    })
    .then(function(mergedArchive) {
        // merged!
        // at this point we could save it safely back to the datasource
    });
```

### Under the hood
Buttercup uses standard AES CBC encryption with 256bit keys, salts, and a SHA-256 HMAC for authentication. It encrypts and decrypts text only, and uses GZip to compress the history before encryption.

The encryption that Buttercup uses was strong enough that it warranted its own repository and identity, and it now resides in a package called [iocane](https://github.com/perry-mitchell/iocane). Its sole job is encryption and decryption using proven, strong methods that have a lengthy field record - like AES CBC.

The keys used for encryption are generated using the PBKDF2 algorithm with 10s/100s of thousands of iterations. The core-web library also uses the same algorithm for key generation in **iocane** to remain compatible with the PC version. To keep up in terms of speed, [core-web patches the PBKDF2 functionality](https://github.com/buttercup-pw/buttercup-core-web/blob/da68a4284f8ac8aa12283b93fc99ae55df4918a0/source/HashingTools.js#L98) in the browser with that of the `SubtleCrypto` interface.

As iocane uses mostly Node's built-in encryption methods for its AES encryption, there's no hope of retrieving the data within an archive if the master password is forgotten.

#### Storage
Buttercup outputs `.bcup` files when using a `Datasource` other than `TextDatasource`. These `bcup` files are text files and take up little space (even with a hefty history - gzip compression of repeating IDs is good!). They're safe to store on your PC, but should never be carelessly shared with anyone.

### Usability
Buttercup was designed primarily as a password manager - one which would be used in graphical environments for authenticating users in a variety of environments. That's not to say that this is its only use, however...

Buttercup provides an interface to store a tree of data with configurable node structures in a secure manner. With little work, any sort of interface could be written over the top of Buttercup to provide a secure data store for many use cases.

[git-labelmaker](https://github.com/himynameisdave/git-labelmaker) actually [uses Buttercup to fetch and store user tokens](https://github.com/himynameisdave/git-labelmaker/blob/92dd4f31005a10ab72c1dc38505dd68baa4a91fe/bin/modules/fetchToken.js#L40) for interacting with Github.

Whether it's as a backend to some application or a supporting mechanism for a physical device, Buttercup can be made to store and retrieve any kind of sensitive data.
