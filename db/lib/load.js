'use strict';

const request   = require('request');
const cheerio   = require('cheerio');

module.exports = function (url, silent, cb) {
    if (typeof silent === 'function') {
        cb = silent;
        silent = false;
    }

    let loadStartTime = Date.now();

    if (!silent)
        console.log('Loading monster data from %s', url);

    request.get(url, function (err, res, body) {
        if (err) return cb(err);

        const $ = cheerio.load(body);
        const title = $('.main-title').text().trim();
        const titleParts = title.match(/([^ ]+) ([^\(]+) \(([^\)]+)\)/);

        if (!titleParts) {
            return cb(new Error('Failed to load monster title.'));
        }

        let monsterData = {
            postId: $('#page-content').data('postid'),
            type: titleParts[1].toLowerCase(),
            name: titleParts[2],
            awakenedName: titleParts[3],
            url: url,
            details: {},
            ratings: {},
            reactions: {},
            runes: []
        };

        parseDetails($('.details-wrapper'), monsterData.details);
        parseRatings($('.total-info'), monsterData.ratings);
        parseReactions($('.reactions-wrapper'), monsterData.reactions);
        parseRunes($('.the-content'), monsterData.runes);

        if (!silent)
            console.log('Load completed in %dms.', (Date.now() - loadStartTime));

        cb(null, monsterData);
    });
}

function parseDetails($details, out) {
    $details.find('.detail-item').each(function (i, element) {
        const $elm = cheerio(element);
        const $value = $elm.find('.detail-content');
        const title = $elm.find('.detail-label').text().trim().toLowerCase();

        let value = $value.children().first().text().trim().toLowerCase();

        switch (title) {
            case 'grade':
                out.grade = value.length;
                break;

            case 'type':
                out.type = value;
                break;

            case 'get from':
                out.get = value.split(', ');
                break;

            case 'stats':
                value = value.split('\n');
                value.forEach(function (v) {
                    let vs = v.split(':');
                    if (vs.length !== 2) return;

                    out[vs[0].trim()] = parseInt(vs[1].trim(), 10);
                });
                break;

            case 'good for':
                out.goodFor = value;
                break;

            case 'badges':
                out.tags = $value.children().map((i, v) => cheerio(v).attr('title')).get();
                break;
        }
    });
}

function parseRatings($info, out) {
    $info.find('.total-rating-wrapper').each(function (i, element) {
        const $elm = cheerio(element);
        const type = $elm.find('.section-subtitle').text().trim().toLowerCase();
        const value = parseFloat($elm.find('.number').text().trim(), 10);

        out[type === 'total score' ? 'review' : 'users'] = value;
    });
}

function parseReactions($reactions, out) {
    $reactions.find('.reaction').each(function (i, element) {
        const $elm = cheerio(element);
        const type = $elm.data('reaction');
        const value = parseInt($elm.find('.reaction-percentage').text().trim(), 10);

        out[type] = value;
    });
}

function parseRunes($content, out) {
    const runeFilter = function (i, e) { return cheerio(e).text().trim().toLowerCase() === 'rune recommendations' };
    const $rune = $content.find('h2 strong').filter(runeFilter).parent();
    const $runes = $rune.nextUntil('h1, h2, h3, h4, h5, h6', 'p');

    $runes.each(function (i, element) {
        const $elm = cheerio(element);
        const text = $elm.text().trim().toLowerCase();

        if (!text) return;

        const values = text.split('–');
        const details = values[(values.length === 1 ? 0 : 1)].trim().split('(');

        let build = {
            name: values.length === 1 ? '' : values[0].trim(),
            runes: details[0].split('/').map(cleanupRuneNames),
            stats: details[1].replace(')', '').split('/').map(cleanupRuneStats)
        };

        out.push(build);
    });
}

function cleanupRuneNames(val) {
    return val
        .replace(/x\d/g, '')
        .trim();
}

function cleanupRuneStats(val) {
    return val
        .replace('crit r', 'crit rate')
        .replace('crit d', 'crit damage')
        .trim();
}
