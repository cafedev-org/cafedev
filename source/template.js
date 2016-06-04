"use strict";

const fs = require("fs");
const path = require("path");

const navTools = require("./nav.js");

const root = path.resolve(path.join(__dirname), "..");
const themeDir = path.join(root, "assets", "theme");

const articlePageTemplate = fs.readFileSync(
    path.join(root, "assets", "theme", "article-template.html"),
    "utf8"
);

const indexPageTemplate = fs.readFileSync(path.join(themeDir, "index.html"), "utf8");

module.exports = {

    processArticlePage: function(data) {
        return articlePageTemplate
            .replace(/\[CAFEDEV:CONTENT\]/g, data.content)
            .replace(/\[CAFEDEV:TITLE\]/g, data.title)
            .replace(/\[CAFEDEV:SUBTITLE\]/g, data.subtitle)
            .replace(/\[CAFEDEV:HEADERIMG\]/g, data.headerImg)
            .replace(/\[CAFEDEV:SIDEBAR_RECENT\]/g, data.sidebarRecent)
            .replace(/\[CAFEDEV:HOME\]/g, navTools.getLinkForHome());
    },

    processIndexPage: function(data) {
        return indexPageTemplate
            .replace(/\[CAFEDEV:SIDEBAR_RECENT\]/g, data.sidebarRecent)
            .replace(/\[CAFEDEV:HOME\]/g, navTools.getLinkForHome());
    }

};
