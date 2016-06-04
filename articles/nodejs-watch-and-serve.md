<!--
author:perry.mitchell
date:2016-06-04
title:NodeJS watch and serve
subtitle:Developing NodeJS apps by watching and serving source
headerImg:watch.jpg
-->
It's no secret that developing with NodeJS is both simple and highly productive. It's terribly easy to get started and there's very little to do to be able to develop powerful command line applications. A common approach to rapidly developing these applications is watching and reloading when changes are made to the source code.

This isn't new, but thanks to the vibrant ecosystem that is **npm**, there's a couple of packages that make reloading as you save a cinch.

The first tool I'd recommend is [nodemon](https://www.npmjs.com/package/nodemon), which is a very easy-to-use watching application. Nodemon watches for source changes in specified locations and reloads a specified JavaScript entry point. After installing nodemon by running `npm install nodemon --save-dev`, add an npm script called `watch` with a command like `nodemon --watch source/**/*.js source/index.js`. Running `npm run watch` at this stage will execute nodemon to watch all `.js` files in the _source_ directory, and when any are changed, `source/index.js` will be terminated and restarted.

![nodemon watch](changesupdate.png)
