const path = require("path");
const easyimage = require("easyimage");

const navTools = require("./nav.js");

const root = path.resolve(path.join(__dirname), "..");
const buildDir = path.join(root, "build");

let mediaTools = module.exports = {

    getArticleHeaderImageURL: function(articleData) {
        let headerImgSize = mediaTools.getImageThumbnailSizes().articleHeader,
            filename = mediaTools.getImageThumbnailName(articleData.properties.headerImg, headerImgSize);
        return {
            filename,
            url: `${articleData.href}/${filename}`
        };
    },

    getArticleIndexThumbnailURL: function(articleData) {
        let indexThumbSize = mediaTools.getImageThumbnailSizes().index,
            filename = mediaTools.getImageThumbnailName(articleData.properties.headerImg, indexThumbSize);
        return {
            filename,
            url: `${articleData.href}/${filename}`
        };
    },

    getImageThumbnailName: function(filename, size) {
        let filenameParts = filename.split("."),
            ext = filenameParts.pop().toLowerCase();
        return filenameParts.concat(size).concat(ext).join(".");
    },

    getImageThumbnailSizes: function() {
        return {
            index: "400x",
            articleHeader: "1200x"
        };
    },

    getImageThumbnailSizesOnly: function() {
        let sizes = mediaTools.getImageThumbnailSizes();
        return Object.keys(sizes).map((name) => sizes[name]);
    },

    processArticleThumbs: function(articleData) {
        let headerImgFilename = articleData.properties.headerImg,
            articleOutputDir = navTools.getArticleDirectory(articleData);
        let promises = mediaTools
            .getImageThumbnailSizesOnly()
            .map((size) => ({
                size,
                filename: mediaTools.getImageThumbnailName(headerImgFilename, size)
            }))
            .map(function(info) {
                let config = {
                        src: path.join(articleOutputDir, headerImgFilename),
                        dst: path.join(articleOutputDir, info.filename)
                    },
                    [width, height] = info.size.split("x");
                if (height) {
                    config.height = height;
                }
                if (width) {
                    config.width = width;
                }
                return easyimage.rescrop(config);
            });
        return Promise.all(promises);
    }

};
