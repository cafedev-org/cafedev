<!--
author=perry.mitchell
date=2016-06-26 00:32:10
title=Deploying NodeJS projects with flightplan
description=Deploy NodeJS applications with ease to remote servers using Flightplan
headerImg=fighter.jpg
tags=nodejs,javascript,deploying
-->
NodeJS makes rapid application development a cinch with its ease of use and basic learning curve, but deploying applications built with Node can be challenging and fraught with problems. When it comes to deploying Node applications to remote servers, [Flightplan](https://www.npmjs.com/package/flightplan) makes the deployment configuration and management terribly simple and easy to maintain.

Flightplan is an npm module that uses a `flightplan.js` file to configure deployment strategies. It uses target specifications (staging/production etc.) with server details (addresses, credentials, connection method etc.) alongside **local** and **remote** tasks.

Here's a brief example:

```js
let plan = require("flightplan");

// targets
plan.target('production', {
    host: 'myserver.org',
    username: 'deployer',
    agent: process.env.SSH_AUTH_SOCK
});

// run tasks locally
plan.local(function(local) {
    local.log("Building...");
    local.exec("npm run build");

    local.log("Copying files...");
    let filesToCopy = local.exec("git ls-files", {silent: true});
    local.transfer(filesToCopy, "/tmp/deployment/");
});

// run tasks remotely
plan.remote(function(remote) {
    remote.log("Copying files...");
    remote.exec("cp -r /tmp/deployment/ ~/prod/");
});
```

Because Flightplan uses a JavaScript configuration file, you can easily tap into other npm packages and personal helpers to get the job done. Using the `remote` functionality you can execute commands on all endpoints as if they were a single entity - everyone gets the some instructions.

Of course, my example so far doesn't cover deploying executable applications at all, let alone daemons - I'll get to that - But first, let's start with a real-world example of a deployable application.

### The application

Say we have a little HTTP server that responds with a random number:

```js
const http = require('http');

const PORT = 8080;

// Handle requests
function handleRequest(request, response){
    response.end("" + Math.ceil(Math.random() * 10));
}

// Server instance
let  server = http.createServer(handleRequest);

server.listen(PORT, function() {
    console.log(`Server listening on port ${PORT}`);
});
```

When started, this server will continue running until halted. When we deploy it, we need to update the code on the machine and restart the server so that the changes take affect. Before we take care of the reloading of our server, let's get the deployment process underway.

### Flightplan

Flightplan is a wonderful NodeJS library that I've used both professionally and personally over the last several years. It's helped me and my team move large, complex application servers to their remote targets hundreds of times with just a single command and some tens of lines.

Let's jump straight into the flightplan file for deploying our little Node app:

```js
let plan = require("flightplan");

// targets
plan.target('production', {
    host: 'test.com',
    username: 'user',
    password: 'pass',
    agent: process.env.SSH_AUTH_SOCK
});

// run tasks locally
plan.local(function(local) {
    local.log("Copying files...");
    let filesToCopy = local.exec(`find . -type f -follow -print | grep -v "node_modules"`, {silent: true});
    local.transfer(filesToCopy, "/tmp/deployment/");
});

// run tasks remotely
plan.remote(function(remote) {
    remote.log("Copying files...");
    remote.exec("cp -r /tmp/deployment/* ~/mysite/");
    remote.log("Booting application...");
    remote.exec("pm2 start ~/mysite/app.js || pm2 restart ~/mysite/app.js");
});
```

In my file I specify the production login credentials so flightplan knows how to connect to the server (ideally this would be without a password and would use keys instead). There's a local task, which copies the files in the current directory to each remote endpoint, and a remote task, which copies the files to their location and starts/restarts the application using [pm2](https://github.com/Unitech/pm2) (another amazing server utility).

Run the deployment using the command `fly production` - **easy!**

_pm2 here is attempting to start the app (which will succeed upon first deployment only), and if it fails, it will try to restart the app. Using a little bash 'or' functionality can help us express this in one line, though it does messy-up the output a bit:_

![flightplan pm2 start restart](flightplan-output.jpg)

Once deployed successfully, we should be able to key in the address to see the output of our application:

![deployed application output](output.png)

_Most of the frustration, at least for me, has been in getting the connection setup correctly. Once this is taken care of, the rest of the process with flightplan is pure joy._

Obviously this example is very small-scale, but expanding to larger groups of servers is not far removed from the code we just looked at. Flightplan supports specifying groups of servers, and because we have access to any JavaScript library or npm package in our Flightplan configuration, we can simply add functionality to dynamically generate a list of servers to deploy to. This can come in very handy when deploying to services such as AWS (but perhaps I'll cover this in a later post).

### Caveats

There's a few points to mention that are either passed on from dev to dev or learned the hard way. Once such point is the fact that ssh can be a little harsh and block connecting when attempting to connect to a new host. ssh will proceed to wait for user input, blocking our beautiful automated deployment process.

A little _hack_ to get around this is to execute an ssh-keyscan command on the host so that the connection process won't prompt for input:

```js
function sshFix(transport, host) {
    transport.log("Fixing SSH...");
    // Forcibly add the remote key to known_hosts:
    transport.exec(`ssh-keyscan -t rsa,dsa ${host} 2>&1 | sort -u - ~/.ssh/known_hosts > ~/.ssh/tmp_hosts`);
    transport.exec(`mv ~/.ssh/tmp_hosts ~/.ssh/known_hosts`);
}

flightplan.local(function(local) {
    // SSH-fix all endpoints
    flightplan.runtime.hosts.forEach(function(endpoint) {
        sshFix(local, endpoint.host);
    });
});
```

Branching from this issue with ssh is the fact that Flightplan uses rsync underneath the `transport` method, and this can have complicated issues when using more custom forms of interaction with ssh (such as our keyscan trick). To get around this, you can use your own transport method:

```js
function transfer(transport, hostInfo, localFile, remoteFile) {
    transport.log(`Transferring package to: ${hostInfo.host}`);
    transport.exec(`scp ${localFile} ${hostInfo.username}@${hostInfo.host}:${remoteFile}`);
};
```

This obviously further complicates matters, but this is easily added to a bootstrap file if need be. Try Flightplan in vanilla first and move on from there to suit your needs - It's a solid application that fantastically abstracts the deployment process.
