"use strict";

const fs = require("fs");
const path = require("path");

const pug = require("pug");

const navTools = require("./nav.js");

const root = path.resolve(path.join(__dirname), "..");
const themeDir = path.join(root, "assets", "theme");
const indexPageTemplate = path.join(root, "assets", "theme", "home.pug");
const articlePageTemplate = path.join(root, "assets", "theme", "article.pug");

const lib = module.exports = {

    processArticlePage: function(data, recentArticlesData = []) {
        let tags = data.properties.tags ? data.properties.tags.split(",") : [];
        let html = pug.renderFile(articlePageTemplate, {
            title: data.properties.title,
            description: data.properties.description,
            slug: data.slug,
            content: data.content,
            imgHeader: data.properties.headerImg,
            href: data.href,
            keywords : data.properties.tags || "",
            tags: tags,
            date: data.fullDate,
            author: data.author,
            linkHome: navTools.getLinkForHome(),
            recentArticles: recentArticlesData.map(lib.transformArticleDataForTemplate)
        });
        return html;
    },

    processIndexPage: function(recentArticlesData = []) {
        let html = pug.renderFile(indexPageTemplate, {
            title: "Cafe Dev",
            linkHome: navTools.getLinkForHome(),
            recentArticles: recentArticlesData.map(lib.transformArticleDataForTemplate)
        });
        return html;
    },

    transformArticleDataForTemplate: function(articleData) {
        return {
            title: articleData.properties.title,
            description: articleData.properties.description,
            link: navTools.getLinkForArticle(articleData),
            slug: articleData.slug
        };
    }

};
