'use strict';

const inquirer  = require('inquirer');
const async     = require('async');
const merge     = require('merge');

const data      = require('../lib/data');
const upsert    = require('../lib/upsert');
const search    = require('../lib/search');
const load      = require('../lib/load');

module.exports = function (argv, db, store, changeState) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'query',
            message: 'Search term:'
        }
    ], function (answers) {
        async.waterfall([
            // Search
            function (_done) {
                search(answers.query, _done);
            },
            // Prompt
            function (results, _done) {
                if (!results || !results.length)
                    return _done(new Error('No results'));

                if (results.length === 1) {
                    _done(null, results[0].value);
                }
                else {
                    results.push(new inquirer.Separator());
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'mon',
                            message: 'Which monster',
                            choices: results
                        }
                    ], function (answers) {
                        _done(null, answers.mon);
                    });
                }
            },
            // Load Data
            function (url, _done) {
                load(url, _done);
            }
        ], function (err, result) {
            if (err) return changeState(data.STATES.ERROR, err);

            upsert(db, store, result, true);

            console.log('Monster stored!');

            changeState(data.STATES.MENU);
        });
    });
};
