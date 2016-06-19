"use strict";

function objectToXML(obj) {
    return Object.keys(obj).map(key => `<${key}>${obj[key]}</${key}>`).join("\n");
}

module.exports = class SitemapGenerator {

    constructor() {
        this._items = [];
    }

    addLocation(url, lastmod, prio=0.5, changefreq="daily") {
        this._items.push({
            loc: url,
            lastmod: lastmod,
            changefreq: changefreq,
            priority: prio
        });
    }

    render() {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${this._items.map(objectToXML).map(xml => `<url>\n${xml}\n</url>`).join("\n")}
        </urlset>
        `;
    }

};
