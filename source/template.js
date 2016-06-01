"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(path.join(__dirname), "..");

const articlePageTemplate = fs.readFileSync(
    path.join(root, "assets", "theme", "article-template.html"),
    "utf8"
);

module.exports = {

    processArticlePage: function(content) {
        return articlePageTemplate
            .replace("[CAFEDEV:CONTENT]", content);
    }

};
