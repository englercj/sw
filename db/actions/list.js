'use strict';

const Table     = require('cli-table');

const data      = require('../lib/data');

module.exports = function (argv, db, store, changeState) {
    const table = new Table({
        head: ['Count', 'Type', 'Name', 'Awakened Name', 'Rating', 'User Rating', 'Tags']
    });

    const results = store.find();

    table.push.apply(table, results.map((v) => {
        return [
            v.count || 1,
            v.type,
            v.name,
            v.awakenedName,
            v.ratings.review || '',
            v.ratings.users || '',
            v.details.tags ? v.details.tags.join(', ') : ''
        ];
    }));

    console.log(table.toString());

    changeState(data.STATES.MENU);
};
