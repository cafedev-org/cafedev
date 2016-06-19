"use strict";

const fs = require("fs.extra");
const path = require("path");

const highlightJS = require("highlight.js");
const marked = require("marked");
const mkdir = require("mkdir-p").sync;
const rimraf = require("rimraf").sync;
const sass = require("node-sass");
const typeset = require("typeset");

const markdownTools = require("./markdown.js");
const templateTools = require("./template.js");
const navTools = require("./nav.js");
const transferTools = require("./transfer.js");

const config = require("../data/config.json");

const root = path.resolve(path.join(__dirname, ".."));
const articlesDir = path.join(root, "articles");
const buildDir = path.join(root, "build");
const themeDir = path.join(root, "assets", "theme");

let renderer = new marked.Renderer(),
    oldCodeRenderer = renderer.code.bind(renderer);
renderer.code = function(text, language) {
    let newCode = oldCodeRenderer(text, language);
    newCode = newCode.replace(`<code class="`, `<code class="hljs `);
    return newCode;
}

// Init
marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    highlight: function(code) {
        return highlightJS.highlightAuto(code).value;
    }
});

// Authors
const authors = require(path.join(root, "data", "authors.json"));

// Cleanup
rimraf(buildDir);
mkdir(buildDir);

// Process markdown headers
let markdownFiles = {},
    filesByDate = {};
fs.readdirSync(articlesDir)
    .filter(filename => /\.md$/.test(filename))
    .forEach(function(markdownFilename) {
        console.log(`Parsing: ${markdownFilename}`);
        let contents = fs.readFileSync(path.join(articlesDir, markdownFilename), "utf8"),
            data = markdownTools.processContents(contents),
            dateInfo = markdownTools.processDate(data.properties.date),
            urlArticleName = markdownFilename.split(".")[0];
        let articleData = {
            contents: data.contents,
            date: dateInfo,
            properties: data.properties,
            slug: urlArticleName
        };
        articleData.href = navTools.getLinkForArticle(articleData);
        markdownFiles[markdownFilename] = articleData;
        filesByDate[`${dateInfo.year}${dateInfo.month}${dateInfo.day}${urlArticleName}`] = markdownFilename;
    });

let newestArticles = Object.keys(filesByDate);
newestArticles.sort();
newestArticles.reverse();
newestArticles = newestArticles
    .map(key => markdownFiles[filesByDate[key]])
    .slice(0, 3);

// Styling
console.log("Processing SASS");
let indexCSS = sass.renderSync({
        file: path.join(themeDir, "style", "home.sass")
    }).css.toString("utf8"),
    articleCSS = sass.renderSync({
        file: path.join(themeDir, "style", "article.sass")
    }).css.toString("utf8");

// Process index
console.log("Processing index");
let indexData = templateTools.processIndexPage(
    indexCSS,
    newestArticles
);
fs.writeFileSync(path.join(buildDir, "index.html"), indexData);

// Process markdown articles
let markdownProcedures = Object.keys(markdownFiles).map(function(markdownFilename) {
    let articleData = markdownFiles[markdownFilename];
    console.log(`Processing: ${articleData.properties.title} (${markdownFilename})`);
    let author = authors[articleData.properties.author],
        articleOutputDir = navTools.getArticleDirectory(articleData);
    if (!author) {
        throw new Error("Unknown author");
    }
    return Promise.resolve().then(function() {
        let htmlContent = typeset(marked(articleData.contents.trim())),
            pageContent = templateTools.processArticlePage(
                Object.assign(
                    articleData,
                    {
                        content: htmlContent
                    }
                ),
                articleCSS,
                newestArticles
            );
        mkdir(articleOutputDir);
        fs.writeFileSync(
            path.join(articleOutputDir, "index.html"),
            pageContent
        );
    })
    .then(function() {
        return transferTools.transferArticleImages(articleData);
    });
});

// Assets
Promise
    .all(markdownProcedures)
    // .all(markdownProcedures.concat([
    //     new Promise(function(resolve, reject) {
    //         fs.copyRecursive(path.join(themeDir, "assets"), path.join(buildDir, "assets"), function(err) {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve();
    //             }
    //         });
    //     }),
    //     new Promise(function(resolve, reject) {
    //         fs.copyRecursive(path.join(themeDir, "images"), path.join(buildDir, "images"), function(err) {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 resolve();
    //             }
    //         });
    //     })
    // ]))
    .then(function() {
        console.log("Done.");
        process.exit(0);
    })
    .catch(function(err) {
        setTimeout(function() {
            throw err;
        });
    });
