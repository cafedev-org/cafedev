"use strict";

const VALID_HEADER = /^<!--[\s\n]+?author:[\w.]+(.|\n)+-->/m;

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function getDaySuffix(day) {
    let strDay = "" + day,
        lastDigit = strDay[strDay.length - 1];
    switch (lastDigit) {
        case "1":
            return "st";
        case "2":
            return "nd";
        case "3":
            return "rd";
        default:
            return "th";
    }
}

module.exports = {

    getDateForArticle: function(articleData) {
        let dateParts = articleData.properties.date.split(" "),
            datePortion = dateParts[0],
            timePortion = dateParts[1];
        let [ year, month, day ] = datePortion.split("-"),
            monthName = MONTHS[month - 1],
            suffix = getDaySuffix(day);
        day = day.toString().replace(/^0/, "");
        //return `${day}${suffix} ${monthName} ${year}`;
        return `${year}-${month}-${day} ${timePortion}`;
    },

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
