"use strict";

const fs = require("fs");
const path = require("path");

const marked = require("marked");
const mkdir = require("mkdir-p").sync;
const rimraf = require("rimraf").sync;

const markdownTools = require("./markdown.js");

const root = path.resolve(path.join(__dirname, ".."));
const articlesDir = path.join(root, "articles");
const buildDir = path.join(root, "build");

// Init
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
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
        articleOutputDir = path.join.apply(null, [buildDir, "article"].concat(dirStructure));
    mkdir(articleOutputDir);
    fs.writeFileSync(
        path.join(articleOutputDir, "index.html"),
        data.contents.trim()
    );
});
