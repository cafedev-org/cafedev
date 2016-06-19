<!--
author:perry.mitchell
date:2016-06-04
title:NodeJS watch and serve
subtitle:Developing NodeJS apps by watching and serving source
headerImg:watch.jpg
tags:nodejs,watching,serving
-->
It's no secret that developing with NodeJS is both simple and highly productive. It's terribly easy to get started and there's very little to do to be able to develop powerful command line applications. A common approach to rapidly developing these applications is watching and reloading when changes are made to the source code.

This isn't new, but thanks to the vibrant ecosystem that is **npm**, there's a couple of packages that make reloading as you save a cinch.

The first tool I'd recommend is [nodemon](https://www.npmjs.com/package/nodemon), which is a very easy-to-use watching application. Nodemon watches for source changes in specified locations and reloads a specified JavaScript entry point. After installing nodemon by running `npm install nodemon --save-dev`, add an npm script called `watch` with a command like `nodemon --watch source/**/*.js source/index.js`. Running `npm run watch` at this stage will execute nodemon to watch all `.js` files in the _source_ directory, and when any are changed, `source/index.js` will be terminated and restarted.

![nodemon watch](changesupdate.png)

If you're building a client library or other types of assets for the web, an easy way to test these locally is by serving them during development. [serve](https://www.npmjs.com/package/serve) is a great tool to very quickly serve all content within a directory on a specific port. I'd recommend installing serve globally with `sudo npm install serve -g`, as it's great all-round tool, but it can easy accompany any library as an npm script. Creating a script called `serve` with a command such as `serve -p 8080 build/` will serve your built assets on port 8080.

Together, nodemon and serve can assist you to quickly get into continuous development mode where your changes are served immediately to the browser.

```json
{
  "name": "myapp",
  "version": "0.1.0",
  "description": "My library",
  "main": "source/index.js",
  "scripts": {
    "build": "node source/index.js",
    "server": "serve -p 8080 ./build",
    "watch": "nodemon --watch source source/index.js"
  },
  "devDependencies": {
    "nodemon": "^1.9.2",
    "serve": "^1.4.0"
  }
}
```

Of course, these tools only scrape the surface when it comes to development setups. If you're building a more involved library, larger workflow tools like [webpack](https://www.npmjs.com/package/webpack) and [webpack dev server](https://www.npmjs.com/package/webpack-dev-server) are definitely more suitable.
