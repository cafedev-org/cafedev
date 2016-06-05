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

    processArticlePage: function(data, styles, recentArticlesData = []) {
        let html = pug.renderFile(articlePageTemplate, {
            title: data.properties.title,
            subtitle: data.properties.subtitle,
            slug: data.slug,
            imgHeader: data.properties.headerImg,
            linkHome: navTools.getLinkForHome(),
            recentArticles: recentArticlesData.map(lib.transformArticleDataForTemplate),
            styles: styles
        });
        return html;
        // return articlePageTemplate
        //     .replace(/\[CAFEDEV:CONTENT\]/g, data.content)
        //     .replace(/\[CAFEDEV:TITLE\]/g, data.title)
        //     .replace(/\[CAFEDEV:SUBTITLE\]/g, data.subtitle)
        //     .replace(/\[CAFEDEV:SLUG\]/g, data.slug)
        //     .replace(/\[CAFEDEV:HEADERIMG\]/g, data.headerImg)
        //     .replace(/\[CAFEDEV:SIDEBAR_RECENT\]/g, data.sidebarRecent)
        //     .replace(/\[CAFEDEV:HOME\]/g, navTools.getLinkForHome());
    },

    processIndexPage: function(styles, recentArticlesData = []) {
        let html = pug.renderFile(indexPageTemplate, {
            title: "Cafe Dev",
            linkHome: navTools.getLinkForHome(),
            recentArticles: recentArticlesData.map(lib.transformArticleDataForTemplate),
            styles: styles
        });
        return html;
        // return indexPageTemplate
        //     .replace(/\[CAFEDEV:SIDEBAR_RECENT\]/g, data.sidebarRecent)
        //     .replace(/\[CAFEDEV:HOME\]/g, navTools.getLinkForHome());
    },

    transformArticleDataForTemplate: function(articleData) {
        return {
            title: articleData.properties.title,
            subtitle: articleData.properties.subtitle,
            link: navTools.getLinkForArticle(articleData),
            slug: articleData.slug
        };
    }

};
