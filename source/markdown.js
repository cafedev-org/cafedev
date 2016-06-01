"use strict";

const VALID_HEADER = /^<!--[\s\n]+?author:[\w.]+(.|\n)+-->/m;

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

module.exports = {

    processContents: function(markdownData) {
        let headerMatch = markdownData.match(VALID_HEADER);
        if (!headerMatch) {
            throw new Error("File has invalid header");
        }
        let header = headerMatch[0],
            props = {};
        markdownData = markdownData.substr(header.length);
        header.split("\n").forEach(function(line) {
            if (/[a-z]+:.+?/.test(line)) {
                let propData = line.split(":");
                props[propData[0].trim()] = propData[1].trim();
            }
        });
        return {
            contents: markdownData,
            properties: props
        };
    },

    processDate: function(str) {
        let [
            year,
            month,
            day
        ] = str.split("-");
        let monthName = MONTHS[month - 1];
        return {
            year, month, day,
            monthName
        };
    }

};
