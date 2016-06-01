"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(path.join(__dirname), "..");

const articlePageTemplate = fs.readFileSync(
    path.join(root, "assets", "theme", "article-template.html"),
    "utf8"
);

module.exports = {

    processArticlePage: function(data) {
        return articlePageTemplate
            .replace(/\[CAFEDEV:CONTENT\]/g, data.content)
            .replace(/\[CAFEDEV:TITLE\]/g, data.title)
            .replace(/\[CAFEDEV:SUBTITLE\]/g, data.subtitle)
            .replace(/\[CAFEDEV:HEADERIMG\]/g, data.headerImg);
    }

};
