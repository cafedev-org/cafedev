"use strict";

const config = require("./config.js");

module.exports = {

    getLinkForArticle: function(articleData) {
        let [
                year, month
            ] = articleData.properties.date.split("-"),
            slug = articleData.slug;
        return `${config.protocol}://${config.domain}/article/${year}/${month}/${slug}`;
    },

    getLinkForHome: function() {
        return `${config.protocol}://${config.domain}`;
    }

};
