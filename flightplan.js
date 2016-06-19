"use strict";

const exec = require("child_process").exec;

const plan = require("flightplan");

// Target
plan.target("production", [
    {
        host: 'cafedev.org',
        username: 'root',
        agent: process.env.SSH_AUTH_SOCK
    }
]);

plan.local(function(local) {
    local.log("Building...");
    local.waitFor(function(done) {
        exec("npm run build", function(err) {
            if (err) {
                throw new Error("Failed building.");
            }
            (done)();
        });
    });
});

plan.local(function(local) {
    local.log("Archiving...");
    local.exec("cd build && tar -czf deploy.tar.gz *");
    local.exec("mv build/deploy.tar.gz ./");
    local.log("Transferring...");
    local.transfer("deploy.tar.gz", "/tmp/");
    local.exec("rm deploy.tar.gz");
});

plan.remote(function(remote) {
    remote.log("Extracting deployment package...");
    remote.exec("tar -zxvf /tmp/deploy.tar.gz -C /usr/share/nginx/cafedev");
    remote.exec("rm /tmp/deploy.tar.gz");
});
