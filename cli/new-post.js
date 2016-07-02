const prompt = require("prompt");

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

function getPostData(options) {
    let postData = {},
        requiresPrompt = false,
        promptSchema = { properties: {} };
    Object.keys(requiredProperties).forEach(function(propName) {
        if (options[propName] && options[propName].length > 0 && typeof options[propName] === "string") {
            postData[propName] = options[propName];
        } else {
            requiresPrompt = true;
            promptSchema.properties[propName] = requiredProperties[propName];
        }
    });
    if (requiresPrompt) {
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
    return Promise.resolve(postData);
}

module.exports = function newPost(options) {
    getPostData(options)
        .then(function(data) {
            if (data.slug.trim().length <= 0) {
                data.slug = postTools.convertTitleToSlug(data.title);
            }
            console.log(data);
        });
};
