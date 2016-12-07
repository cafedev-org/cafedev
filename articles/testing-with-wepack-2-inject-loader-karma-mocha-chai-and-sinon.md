<!--
title=Testing with Webpack 2, inject-loader, karma, mocha, chai and sinon
author=perry.mitchell
description=Testing shouldn't be difficult, and often it takes a completely new project to see that setting up a clean test harness is straightforward and very rewarding.
date=2016-12-06 16:37:19
tags=webpack,nodejs,testing,watching
headerImg=webpack_alt.jpg
-->
[Webpack](https://webpack.github.io/) is a powerful build tool perfectly suited to building layered, complex JavaScript applications that make use of lots of different tools, styles and media. It uses a `webpack.config.js` configuration file to find the files and content it needs for compiling the final build output(s). Because the configuration is a regular JavaScript file, it allows developers to be very expressive and creative with how they specify their application's inputs and outputs.

There's a number of ways to do it, but webpack can be configured to behave differently for each environment you have - for instance, your testing configuration will obviously differ in some ways to your production build. You may have use for a build that is very close to production's that you use for testing, but chances are your production build will be minified (and minification can take some time). Already you have several different configurations you want to handle, and because webpack reads the configurations from the exports of the configuration file, you can specify different parameters based upon the environment.

So webpack sounds good for testing, but what about the rest of our harness? Choosing from some of the most popular tools, I've gone with mocha, chai and sinon (there are tonnes of testing tools, but I know that these play nicely together). [Mocha](https://mochajs.org/) is a testing framework that provides the structure for specifying and setting-up your tests. [Chai](http://chaijs.com/) is an assertion library that gives you a swiss army knife of _expectations_ you can use to constrain the behaviour of your application. [Sinon](http://sinonjs.org/) is a mocking library that helps wrap your tests up into a purposeful and controllable _unit_ of functionality - it provides many methods of stubbing dependencies for the purpose of testing interconnected components.

The amazing team behind webpack have released version 2 in beta, and it's definitely the way to go in terms of speed and configuration expression. Of course it's beta and should be used carefully, but if you know how to lock down your dependencies properly with restrictive semver ranges or shrinkwrap the risk is minimal. This post will be referring to version 2 (2.1.0-beta.27) and how best to get it working with the other tools I've already mentioned. Let's jump straight into installing our required packages...

Firstly, let's install webpack by running `npm install webpack@2.1.0-beta.27 --save`. We're going to be working with ES6 in this project, so let's include babel as well: `npm install babel-core babel-loader babel-preset-2015 --save`.

We can also install our testing tools now as well by running the following:

```sh
npm install mocha chai sinon karma karma-chai karma-mocha karma-sinon karma-webpack karma-chrome-launcher --save-dev
```

I'll even give you a sneak-peak at our `package.json` so you can see how I've setup the project:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "entry.js",
  "scripts": {
    "build": "webpack --progress",
    "test": "NODE_ENV=testing karma start --single-run",
    "test:watch": "NODE_ENV=testing karma start"
  },
  "dependencies": {
    "babel-core": "^6.18.2",
    "babel-loader": "^6.2.8",
    "babel-preset-es2015": "^6.18.0",
    "webpack": "2.1.0-beta.27"
  },
  "devDependencies": {
    "chai": "^3.5.0",
    "inject-loader": "2.0.1",
    "karma": "^1.3.0",
    "karma-chai": "^0.1.0",
    "karma-chrome-launcher": "^2.0.0",
    "karma-mocha": "^1.3.0",
    "karma-sinon": "^1.0.5",
    "karma-webpack": "^1.8.0",
    "mocha": "^3.2.0",
    "sinon": "^1.17.6"
  }
}
```

Doesn't look so crazy, right? The bare setup that we've just created **is** very basic, and there's a large number of other **loaders** and tools that will most likely be added as your project comes together.

> A **loader** is a content handler for webpack. It takes content (JavaScript, text, HTML, SASS, CSS, images etc.) as input and outputs a transformed copy that webpack wraps into the final bundles. It allows us to transform content into different formats for better consumption by clients, like how babel transforms ES6 code into ES5 (babel-loader).

### The application
Let's introduce our application - it's a basic one, but it's enough to represent a basic use-case of webpack and loaders:

First up is a little helper file called `filea.js` - imaginative right? Hardly:

```javascript
export function getSpecialValue() {
    return 10;
}
```

We can see that `getSpecialValue()` simply returns `10`, and that the function is exported for use elsewhere.

Our primary file `entry.js` is responsible for all the setup in the library:

```javascript
import { getSpecialValue } from "filea";

export function getValue() {
    return getSpecialValue() * 2;
}
```

Our main file imports _only_ `getSpecialValue` from `filea.js` and uses it in its own function `getValue()`.

> The directives `import` and `export` are what **ES6** uses to handle dependency loading. They're not available in browsers yet, and even if they were, it'd be a very long time until a major portion of users had browsers that supported them. Because if this, we need to transpile them to a pattern like [commonjs](https://webpack.github.io/docs/commonjs.html) that will work in the browsers of today. Webpack 2.x has native support for this process, whereas version 1.x did not.

Looking at our application we can see that we have a tight dependency on `filea.js` from `entry.js`. We can very easily test `filea.js` as a unit, but because `entry.js` depends upon another file for its functionality, we need to get a bit creative when testing it. Before that, though, we need to build them properly into their final form.

### Building
Below is a basic webpack 2 configuration file (`webpack.config.js`):

```javascript
const path = require("path");
const webpack = require("webpack");

module.exports = {

    entry: {
        script: path.resolve(__dirname, "./entry.js")
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: "babel-loader",
                exclude: /(\/node_modules\/|test\.js|\.spec\.js$)/
            }
        ]
    },

    output: {
        path: "./dist",
        filename: "script.js",
        pathinfo: true
    },

    resolve: {
        extensions: [".js"],
        modules: [
            __dirname,
            path.resolve(__dirname, "./node_modules")
        ]
    }

};
```

There's really not much going on here, and webpack does all of the hard work for us by:

 * Finding our entry file(s)
 * Finding all files referenced by it (using the `resolve` section to help it)
 * Piping all found content and source files through the `module.rules` section to find which loader(s) should be used to convert it
 * Rendering all processed content to the `output` file(s)

Before babel will work properly, we need to also tell it what presets to use when compiling. We can do this by giving it an environment-aware `.babelrc` file:

```json
{
    "env": {
        "testing": {
            "presets": [
                "es2015"
            ]
        }
    },
    "presets": [
        ["es2015", { "modules": false }]
    ]
}
```

In our configuration we want babel to handle modules differently in production compared to testing. Because webpack 2 supports `import` and `export`, we don't need babel to handle these in production, and we can set the [modules parameter](https://babeljs.io/docs/plugins/preset-es2015/#options) to `false`. The reason we do want babel to handle these directives in testing will be covered later, and has to do with `inject-loader`.

Once this is configured we can use `npm run build` to build our production-ready (not quite 😬) script.

#### `entry`
This hasn't changed so much since 1.x, and it allows us to specify the entry points into our application. Webpack works by scanning source files for references to other files, and then continues by scanning them also. Weback will include all referenced files in the build output providing that the entries connect to them. You can have multiple entries which will build multiple outputs.

#### `module.rules`
This was originally `module.loaders`, but `module.rules` now allows us to write a more intuitive ruleset for our content loaders. This is where we specify what file types are processed by what loaders. We're only using JavaScript for this project, so we can pipe all `*.js` files into `babel-loader`.

#### `output`
This also hasn't changed much - we can simply specify an output directory and filename. `pathinfo` simply includes comments about which file a `import`->`require` converted statement refers to.

#### `resolve`
The resolve section allows us to specify some rules for webpack to follow to help it find source files. Ours is pretty generic, and it also hasn't changed much from 1.x.

### Testing setup
It may look like we have a lot to configure for the testing phase, with sinon, mocha, chai and karma to deal with, but honestly there's not much going on here either. All of these tools work so well together, most of the setup time is spent specifying glob patterns for finding source and spec files.

We need to start by creating a [karma](https://karma-runner.github.io/1.0/index.html) configuration by running `karma init` (karma probably isn't installed globally, as we have it in our local modules, so this command would actually be `./node_modules/.bin/karma init`). This will create a `karma.config.js` file in the current directory. Karma will prompt you for some environment-specific information, such as which browser(s) you want to test in, and what frameworks you want to test with. If you miss something it's ok, you can just add it to the configuration file.

After some tweaking, it might look something like this:

```javascript
module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai', 'sinon'],
        files: [
            './*.spec.js'
        ],
        exclude: [],
        preprocessors: {
            "./*.spec.js": ["webpack"]
        },
        // webpack configuration
        webpack: require("./webpack.config.js"),
        webpackMiddleware: {
            stats: "errors-only"
        },
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['ChromeWithoutSecurity'],
        customLaunchers: {
            ChromeWithoutSecurity: {
                base: 'Chrome',
                flags: ['--disable-web-security']
            }
        },
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
        concurrency: Infinity
    });
};
```

The important areas to check are `files`, `preprocessors`, `webpack` and `webpackMiddleware`. We need to specify our test files in the `files` section (these are automatically used as entry points for webpack), as well as in the `preprocessors` section (for webpack handling). We can configure webpack in karma (thanks to the karma-webpack module) by passing the weback configuration in the `webpack` property. `webpackMiddleware` allows us to configure some webpack-specific options, like keeping the console output clean.

We'll leave `singleRun` as `false` to allow for file-watching - we can override this in our npm scripts in `package.json`.

Let's look at our first test - `filea.spec.js`:

```javascript
import { getSpecialValue } from "filea";

describe("filea", function() {

    describe("getSpecialValue", function() {

        it("returns a special value", function() {
            expect(getSpecialValue()).to.equal(10);
        });

    });

});
```

It's super basic, and runs only a single test against the `getSpecialValue` function. We can use `import` here because webpack knows how to use it to find source references.

The [BDD](https://en.wikipedia.org/wiki/Behavior-driven_development) structure is provided to us by mocha (`describe`/`it`) and allows us to write meaningful structures around our testing code. I personally like referring to the tested module in the topmost `describe` block, and then nesting the function-specific blocks under that.

Mocha is extremely powerful and has a wide range of helpers such as `before`, `after`, `beforeEach` and `afterEach` that are terribly useful when it comes to common setup code for a number of specs (`it`).

### Mocking by injection
We've got one last task to accomplish, and that's the entry file's dependency on `filea.js`. Because the only reference to `getSpecialValue` is from within the `getValue` function, there's no way to mock it using our current toolkit, and that's where [inject-loader](https://github.com/plasticine/inject-loader) comes in.

`inject-loader` allows us to mock dependency requirements within a file. `entry.js` is a module that requires another, and we can use `inject-loader` to wrap its request to `getSpecialValue` so that we can **mock** its return value and detect that it's actually **called**.

`inject-loader` doesn't need to be setup within webpack, but just simply needs to be installed.

> I've had [some problems](https://github.com/plasticine/inject-loader/issues/24) getting `inject-loader` to work with webpack 2, but thanks to the owner (and several other people - **thanks!**), we got it working with [version 2.0.1](https://github.com/plasticine/inject-loader/issues/24#issuecomment-264665501).

Take a look at our final test file - `entry.spec.js`:

```javascript
describe("entry", function() {

    beforeEach(function() {
        let fileInjector = require("inject-loader!entry");
        // the mock
        this.filea = {
            getSpecialValue: function() {
                return 1;
            }
        };
        // create mocked module
        this.entry = fileInjector({
            "filea": this.filea
        });
        // attach spy
        sinon.spy(this.filea, "getSpecialValue");
    });

    it("works without override", function() {
        expect(require("entry.js").getValue()).to.equal(20);
    });

    it("overrides", function() {
        expect(this.entry.getValue()).to.equal(2);
    });

    it("gets a special value from filea", function() {
        this.entry.getValue();
        expect(this.filea.getSpecialValue.calledOnce).to.be.true;
    });

});
```

I'm using a `beforeEach` block to do several things: firstly I create the injector method:

```javascript
let fileInjector = require("inject-loader!entry");
```

This function, when called, will return a new version of filea's exports with mocks in place where I specify. It takes an object parameter which is used to provide the mocked module calls. If I want to mock the `filea` module, then I pass a property to the injector method called `filea` which contains all of the function mocks I wish to apply - in this case, just `getSpecialValue`. I return a different value than what it would regularly return to determine that I can mock the interface (this isn't really necessary in a real-world scenario, as it's just for demonstration).

After applying the mock and receiving a mocked copy of `filea` (`this.entry`), I can attach a spy to the `getSpecialValue` method using sinon. In the last spec I can simply check that the `calledOnce` property of the spy is `true` to ensure that `getValue` did indeed call `getSpecialValue`.

### Going forward
Hopefully this walkthrough shows webpack 2 for what it really is - a powerful, professional, and downright easy-to-use build tool that, when accompanied by the right testing utilities, can make for a highly robust and expandable application base. I love using it for all of my projects (even at work - yes we build our production code with this!) and I've barely scratched the surface of its potential.

All of the code I've used in this article is available in [this gist](https://gist.github.com/perry-mitchell/f41b01c87f25f483ecb3c2c7c2fcc74d).

#### Bonus
If you've used `inject-loader` before (or any in-line loader), than you're probably familiar with the old in-line syntax of webpack 1.x:

```javascript
let fileInjector = require("inject!entry");
```

You can get this working again without editing all of your specs by adding the following section to your webpack 2.x configuration file:

```javascript
{
    resolveLoader: {
        moduleExtensions: ['-loader']
    }
}
```
