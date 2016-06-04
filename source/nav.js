"use strict";

const path = require("path");

const config = require("./config.js");

const root = path.resolve(path.join(__dirname, ".."));
const buildDir = path.join(root, "build");

module.exports = {

    getArticleDirectory: function(articleData) {
        let dirStructure = [articleData.date.year, articleData.date.month, articleData.slug],
            articleOutputDir = path.join.apply(null, [buildDir, "article"].concat(dirStructure));
        return articleOutputDir;
    },

    getLinkForArticle: function(articleData) {
        let [
                year, month
            ] = articleData.properties.date.split("-"),
            slug = articleData.slug;
        return `${config.protocol}://${config.domain}/article/${year}/${month}/${slug}`;
    },

    getLinkForHome: function() {
        return `${config.protocol}://${config.domain}`;
    }

};
