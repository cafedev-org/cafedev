const prompt = require("prompt");
const prettyjson = require("prettyjson");
const chalk = require("chalk");
const mkdir = require("mkdir-p");

const fs = require("fs");
const path = require("path");

const postTools = require("../source/post.js");
const timeTools = require("../source/time.js");

const requiredProperties = {
    title: {
        pattern: /^.+$/i,
        message: "Post title",
        required: true
    },
    slug: {
        pattern: /^[a-z_-]+$/,
        message: "Post slug",
        required: false
    },
    author: {
        pattern: /^[a-z\.]+$/,
        message: "Author ID",
        required: true
    },
    "description": {
        pattern: /^.+$/,
        message: "Post description",
        required: true
    },
    "date": {
        pattern: /^\d{4}-\d{2}-\d{2} \d{1,2}:\d{2}:\d{2}$/,
        message: "Post description",
        required: false,
        default: timeTools.getDateTime()
    },
    "tags": {
        pattern: /^[a-zA-Z0-9_]+(,[a-zA-Z0-9_]+)*$/i,
        message: "Post tags",
        required: false,
        default: ""
    }
};

function createPost(postData) {
    postData.headerImg = "";
    let outputPath = path.join(global.__root, "articles", postData.slug + ".md"),
        articleDir = path.join(global.__root, "articles", postData.slug);
    let postContent = "<!--\n";
    Object.keys(postData).forEach(function(key) {
        if (key === "slug") {
            return;
        }
        postContent += `${key}=${postData[key]}\n`;
    })
    postContent += "-->\n";
    fs.writeFileSync(outputPath, postContent);
    mkdir(articleDir);
}

function getPostData(options) {
    let postData = {},
        requiresPrompt = false,
        promptSchema = { properties: {} };
    Object.keys(requiredProperties).forEach(function(propName) {
        if (options[propName] && options[propName].length > 0 && typeof options[propName] === "string") {
            postData[propName] = options[propName];
        }
    });
    promptSchema.properties = requiredProperties;
    prompt.override = postData;
    return new Promise(function(resolve, reject) {
        prompt.get(promptSchema, function(err, result) {
            if (err) {
                console.error("Failed retrieving post information", err);
                (reject)(err);
            } else {
                postData = Object.assign(postData, result);
                (resolve)(postData);
            }
        });
    });
}

module.exports = function newPost(options) {
    let pJSONOps = {
        indent: 4,
        keysColor: 'grey'
    };
    getPostData(options)
        .then(function(data) {
            if (data.slug.trim().length <= 0) {
                data.slug = postTools.convertTitleToSlug(data.title);
            }
            console.log(chalk.underline.blue("Creating post:"));
            console.log(prettyjson.render(data, pJSONOps));
            createPost(data);
        });
};
