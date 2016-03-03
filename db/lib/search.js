'use strict';

const request   = require('request');
const cheerio   = require('cheerio');
const data      = require('./data');

module.exports = function (query, cb) {
    let searchStartTime = Date.now();

    console.log('Searching for "%s"...', query);

    request.post(data.getRequestOptions(query), function onResponse(err, res, body) {
        if (err) return cb(err);

        const $ = cheerio.load(body.replace(data.rgxCleanup, ''));
        const $results = $('.asp_result_pagepost');

        console.log('Search completed, got %d results in %dms', $results.length, (Date.now() - searchStartTime));

        let results = [];

        $results.each(function (i, element) {
            const $elm = $(element).find('h3 > a').eq(0);

            results.push({
                name: $elm.text().trim(),
                value: $elm.prop('href')
            });
        });

        cb(null, results);
    });
}
