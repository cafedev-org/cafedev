"use strict";

const fs = require("fs");
const path = require("path");

const pug = require("pug");

const navTools = require("./nav.js");

const root = path.resolve(path.join(__dirname), "..");
const themeDir = path.join(root, "assets", "theme");
const indexPageTemplate = path.join(root, "assets", "theme", "home.pug");
const articlePageTemplate = path.join(root, "assets", "theme", "article.pug");
const tagPageTemplate = path.join(root, "assets", "theme", "tag.pug");

const __target = {
    environment: global.environment
};

const lib = module.exports = {

    processArticlePage: function(data, recentArticlesData = []) {
        //let tags = data.properties.tags ? data.properties.tags.split(",") : [];
        let html = pug.renderFile(articlePageTemplate, Object.assign({
            title: data.properties.title,
            description: data.properties.description,
            slug: data.slug,
            content: data.content,
            imgHeader: data.properties.headerImg,
            imgHeaderAbs: `${data.href}/${data.properties.headerImg}`,
            href: data.href,
            keywords : data.properties.tags || "",
            tags: data.tags,
            date: data.fullDate,
            author: data.author,
            linkHome: navTools.getLinkForHome(),
            recentArticles: recentArticlesData.map(lib.transformArticleDataForTemplate)
        }, __target));
        return html;
    },

    processIndexPage: function(recentArticlesData = []) {
        let html = pug.renderFile(indexPageTemplate, Object.assign({
            title: "Cafe Dev",
            linkHome: navTools.getLinkForHome(),
            recentArticles: recentArticlesData.map(lib.transformArticleDataForTemplate)
        }, __target));
        return html;
    },

    processTagPage: function(tag, data) {
        let html = pug.renderFile(tagPageTemplate, Object.assign({
            tag: tag,
            href: data.href,
            articles: data.articles.map(lib.transformArticleDataForTemplate)
        }, __target));
        return html;
    },

    transformArticleDataForTemplate: function(articleData) {
        return {
            title: articleData.properties.title,
            description: articleData.properties.description,
            link: navTools.getLinkForArticle(articleData),
            slug: articleData.slug,
            imgHeaderAbs: `${articleData.href}/${articleData.properties.headerImg}`
        };
    }

};
