module.exports = {

    convertTitleToSlug: function(title) {
        let slug = title
            .trim()
            .toLowerCase()
            .split("")
            .map((char) => /\s+/.test(char) ? "-" : char)
            .filter((char) => /[\w-]/u.test(char))
            .join("");
        return slug;
    }

};
