<!--
title=Running test suites recursively with nodeunit
author=perry.mitchell
description=The recursive flag was just added to nodeunit, allowing execution to automatically include test suites in sub directories
date=2016-08-31 17:20:09
tags=nodejs,testing,tools,javascript,oss
headerImg=nodeunit.jpg
-->
[Nodeunit](https://github.com/caolan/nodeunit) is a powerful yet simple test runner built with NodeJS. It's the test runner of choice for my node projects and takes almost no time at all to setup a good suite of tests. Suites are just JavaScript files, so they can include any part of your application or its dependencies when writing tests, so integration with NodeJS applications is a breeze.

### Basic setup
Once you've installed nodeunit from npm, we can write a basic spec to see how it works. Let's assume you have a spec file called `example.js` inside a `test` directory in your project that contains the following:

```js
module.exports = {
    exampleTest: function(test) {
        test.ok(true, "Should be true");
        test.done();
    }
};
```

Running `./node_modules/nodeunit/bin/nodeunit` (you can use just `nodeunit` in your `package.json` scripts) from within your project directory should show something like the following:

```text
example
✔ exampleTest

OK: 1 assertions (12ms)
```

You could have also specified the tests directory via `./node_modules/nodeunit/bin/nodeunit test`, or the exact file with `./node_modules/nodeunit/bin/nodeunit test/example.js`.

### Recusive operation
Let's assume we have a sub directory in our `test` folder called `sub`, and this directory has a test suite called `example2.js`:

```js
module.exports = {
    exampleSubTest: function(test) {
        test.ok(true, "Should also be true");
        test.done();
    }
};
```

Running the name nodeunit command will show the sample result as before:

```text
example
✔ exampleTest

OK: 1 assertions (11ms)
```

This is because nodeunit does not recusively search directories. I recently added a [PR to the nodeunit repo](https://github.com/caolan/nodeunit/pull/308) for recursiveness support via a flag (`-r`). Running `./node_modules/nodeunit/bin/nodeunit -r` should now show the nested suite results:

```text
example
✔ exampleTest

example2
✔ exampleSubTest

OK: 2 assertions (14ms)
```

The feature has only just been merged into `master`, so it should take some time before being released to npm.
