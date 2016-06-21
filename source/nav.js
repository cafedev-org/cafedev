"use strict";

const path = require("path");

const config = require(`../data/config.${global.environment}.json`);

const root = path.resolve(path.join(__dirname, ".."));
const buildDir = path.join(root, "build");

const lib = module.exports = {

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

    getLinkForArticleComments: function(articleData) {
        return lib.getLinkForArticle(articleData) + "#disqus_thread";
    },

    getLinkForHome: function() {
        return `${config.protocol}://${config.domain}`;
    },

    getLinkForTag: function(tag) {
        return `${config.protocol}://${config.domain}/tag/${tag}}`;
    }

};
