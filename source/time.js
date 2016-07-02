"use strict";

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return {
        year,
        month,
        day,
        hour,
        minute: min,
        second: sec
    };
}

module.exports = {

    getDate: function(articleData) {
        let { year, month, day } = articleData ?
            articleData.date :
            getDateTime();
        return `${year}-${month}-${day}`;
    },

    getDateTime: function(articleData) {
        let { year, month, day, hour, minute, second } = articleData ?
            articleData.date :
            getDateTime();
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

};
