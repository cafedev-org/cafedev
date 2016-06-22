"use strict";

const argv = require("minimist")(process.argv.slice(2));

let ENV = argv.environment || "production";
global.environment = ENV;
console.log("Processing for envirnment: " + ENV);

const notifier = require("node-notifier");

const fs = require("fs-extra");
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

const config = require(`../data/config.${ENV}.json`);

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
let tagList = new Set();

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
            urlArticleName = markdownFilename.split(".")[0],
            tags = (data.properties.tags || "").split(",").map(tag => tag.trim());
        let articleData = {
            contents: data.contents,
            date: dateInfo,
            properties: data.properties,
            slug: urlArticleName,
            tags: tags.map(tag => ({ name: tag, link: navTools.getLinkForTag(tag) })),
            tagNames: tags
        };
        tags.forEach(function(tag) {
            tagList.add(tag);
        });
        articleData.href = navTools.getLinkForArticle(articleData);
        markdownFiles[markdownFilename] = articleData;
        filesByDate[`${dateInfo.year}${dateInfo.month}${dateInfo.day}${urlArticleName}`] = markdownFilename;
    });

let articlesByDate = Object.keys(filesByDate);
articlesByDate.sort();
articlesByDate.reverse();
let newestArticles = articlesByDate
    .map(key => markdownFiles[filesByDate[key]])
    .slice(0, 3);

// Styling
console.log("Processing SASS");
let cssData = sass.renderSync({
    file: path.join(themeDir, "style", "index.sass")
}).css.toString("utf8");
mkdir(path.join(buildDir, "static"));
fs.writeFileSync(path.join(buildDir, "static/style.css"), cssData);

// Static assets
console.log("Copying theme assets");
fs.copySync(path.join(themeDir, "static"), path.join(buildDir, "static"));

// Process index
console.log("Processing index");
let indexData = templateTools.processIndexPage(
    newestArticles
);
fs.writeFileSync(path.join(buildDir, "index.html"), indexData);
generator.addLocation(`${config.protocol}://${config.domain}/`, timeTools.getDate(), 1.0, "daily");

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

// Tags
console.log(`Processing ${tagList.size} tags...`);
let tagDir = path.join(buildDir, "tag");
mkdir(tagDir);
tagList.forEach(function(tag) {
    let thisTagDir = path.join(tagDir, tag),
        firstArticle,
        theseTags = articlesByDate
            .map(key => markdownFiles[filesByDate[key]])
            .filter(function(article) {
                if (article.tagNames.indexOf(tag) >= 0) {
                    firstArticle = firstArticle || article;
                    return true;
                }
                return false;
            });
    mkdir(thisTagDir);
    let tagPageContent = templateTools.processTagPage(
        tag,
        {
            href: navTools.getLinkForTag(tag),
            articles: theseTags
        }
    );
    fs.writeFileSync(
        path.join(thisTagDir, "index.html"),
        tagPageContent
    );
    if (firstArticle) {
        generator.addLocation(navTools.getLinkForTag(tag), timeTools.getDate(firstArticle), 0.4);
    }
});

// Assets
Promise
    .all(markdownProcedures)
    .then(function() {
        fs.writeFileSync("build/sitemap.xml", generator.render());
        fs.writeFileSync("build/robots.txt", generator.renderRobots());
    })
    .then(function() {
        notifier.notify({
          "title": "Cafe Dev",
          "message": "Build complete."
        });
        console.log("Done.");
        process.exit(0);
    })
    .catch(function(err) {
        setTimeout(function() {
            throw err;
        });
    });
