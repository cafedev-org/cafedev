"use strict";

const fs = require("fs.extra");
const path = require("path");

const highlightJS = require("highlight.js");
const marked = require("marked");
const mkdir = require("mkdir-p").sync;
const rimraf = require("rimraf").sync;

const markdownTools = require("./markdown.js");
const templateTools = require("./template.js");

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

// Process markdown articles
let markdownFiles = fs.readdirSync(articlesDir).filter(filename => /\.md$/.test(filename));
markdownFiles.forEach(function(markdownFilename) {
    console.log(`Processing: ${markdownFilename}`);
    let contents = fs.readFileSync(path.join(articlesDir, markdownFilename), "utf8"),
        data = markdownTools.processContents(contents),
        author = authors[data.properties.author],
        urlArticleName = markdownFilename.split(".")[0];
    if (!author) {
        throw new Error("Unknown author");
    }
    let dateInfo = markdownTools.processDate(data.properties.date),
        dirStructure = [dateInfo.year, dateInfo.month, urlArticleName],
        articleOutputDir = path.join.apply(null, [buildDir, "article"].concat(dirStructure)),
        htmlContent = marked(data.contents.trim()),
        pageContent = templateTools.processArticlePage(htmlContent);
    mkdir(articleOutputDir);
    fs.writeFileSync(
        path.join(articleOutputDir, "index.html"),
        pageContent
    );
});

// Assets
Promise
    .all([
        new Promise(function(resolve, reject) {
            fs.copyRecursive(path.join(themeDir, "assets"), path.join(buildDir, "assets"), function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }),
        new Promise(function(resolve, reject) {
            fs.copyRecursive(path.join(themeDir, "images"), path.join(buildDir, "images"), function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    ])
    .then(function() {
        console.log("Done.");
    })
    .catch(function(err) {
        setTimeout(function() {
            throw err;
        });
    });
