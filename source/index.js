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
const timeTools = require("./time.js");
const SitemapGenerator = require("./sitemap.js");

const config = require("../data/config.json");

const root = path.resolve(path.join(__dirname, ".."));
const articlesDir = path.join(root, "articles");
const buildDir = path.join(root, "build");
const themeDir = path.join(root, "assets", "theme");

let generator = new SitemapGenerator();

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
let cssData = sass.renderSync({
    file: path.join(themeDir, "style", "index.sass")
}).css.toString("utf8");
mkdir(path.join(buildDir, "static"));
fs.writeFileSync(path.join(buildDir, "static/style.css"), cssData);

// Process index
console.log("Processing index");
let indexData = templateTools.processIndexPage(
    newestArticles
);
fs.writeFileSync(path.join(buildDir, "index.html"), indexData);
generator.addLocation(`${config.protocol}://${config.domain}/`, timeTools.getDate(), 1.0);

// Process markdown articles
let markdownProcedures = Object.keys(markdownFiles).map(function(markdownFilename) {
    let articleData = markdownFiles[markdownFilename];
    console.log(`Processing: ${articleData.properties.title} (${markdownFilename})`);
    let author = authors[articleData.properties.author],
        articleOutputDir = navTools.getArticleDirectory(articleData);
    if (!author) {
        throw new Error("Unknown author");
    }
    articleData.author = author;
    articleData.fullDate = markdownTools.getDateForArticle(articleData);
    return Promise.resolve().then(function() {
        let htmlContent = typeset(marked(articleData.contents.trim())),
            pageContent = templateTools.processArticlePage(
                Object.assign(
                    articleData,
                    {
                        content: htmlContent
                    }
                ),
                newestArticles
            );
        mkdir(articleOutputDir);
        fs.writeFileSync(
            path.join(articleOutputDir, "index.html"),
            pageContent
        );
        generator.addLocation(navTools.getLinkForArticle(articleData), timeTools.getDate(), 0.6);
    })
    .then(function() {
        return transferTools.transferArticleImages(articleData);
    });
});

// Assets
Promise
    .all(markdownProcedures)
    .then(function() {
        fs.writeFileSync("build/sitemap.xml", generator.render());
        fs.writeFileSync("build/robots.txt", generator.renderRobots());
    })
    .then(function() {
        console.log("Done.");
        process.exit(0);
    })
    .catch(function(err) {
        setTimeout(function() {
            throw err;
        });
    });
