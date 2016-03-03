'use strict';

const async     = require('async');

const data      = require('../lib/data');
const upsert    = require('../lib/upsert');
const load      = require('../lib/load');

module.exports = function (argv, db, store, changeState) {
    const results = store.find();
    const updateStart = Date.now();

    console.log('Updating monster list...');

    async.each(results, function (monster, _done) {
        load(monster.url, true, function (err, result) {
            if (err) return _done(err);

            upsert(db, store, result);
            _done();
        });
    }, function (err) {
        if (err) {
            changeState(data.STATES.ERROR, err);
        }
        else {
            console.log('✓ Update completed in %dms', Date.now() - updateStart);
            changeState(data.STATES.MENU);
        }
    });
};
