"use strict";

const fs = require("fs.extra");
const walk = require("walk");
const path = require("path");

const navTools = require("./nav.js");

const root = path.resolve(path.join(__dirname, ".."));
const articlesDir = path.join(root, "articles");
const buildDir = path.join(root, "build");

const lib = module.exports = {

    copyFiles: function(source, destination) {
        return new Promise(function(resolve, reject) {
            fs.copy(
                source,
                destination,
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    },

    transferArticleImages: function(articleData) {
        let articleAssetDir = path.join(articlesDir, articleData.slug),
            articleOutputDir = navTools.getArticleDirectory(articleData);
        let locate = new Promise(function(resolve, reject) {
            let images = [],
                walker = walk.walk(articleAssetDir);
            walker.on("file", function(root, stat, next) {
                if (/\.(jpe?g|png|gif)$/i.test(stat.name)) {
                    images.push(stat.name);
                }
                next();
            });
            walker.on("errors", function() {
                reject();
            });
            walker.on("end", function() {
                resolve(images);
            });
        });
        return locate
            .then(function(images) {
                if (images && images.length > 0) {
                    return Promise.all(
                        images.map(function(imageFilename) {
                            return lib.copyFiles(
                                path.join(articleAssetDir, imageFilename),
                                path.join(articleOutputDir, imageFilename)
                            );
                        })
                    );
                }
            })
            .catch(function(err) {
                console.error("Failed transferring images");
                setTimeout(function() {
                    throw err;
                });
            });
        // let articleOutputDir = navTools.getArticleDirectory(articleData);
        // return Promise.all([
        //     lib.copyFiles(
        //         path.join(articlesDir, articleData.slug, "*.jpg"),
        //         articleOutputDir + "/"
        //     )
        // ]);
    }

};
