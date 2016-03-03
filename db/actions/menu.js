'use strict';

const inquirer  = require('inquirer');
const async     = require('async');
const merge     = require('merge');

const data      = require('../lib/data');

module.exports = function (argv, db, store, changeState) {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an Action',
            choices: [
                { name: 'Add Monster', value: data.STATES.ADD },
                { name: 'Remove Monster', value: data.STATES.REMOVE },
                { name: 'List Monsters', value: data.STATES.LIST },
                { name: 'Update All Monsters', value: data.STATES.UPDATE },
                new inquirer.Separator(),
                { name: 'Exit', value: data.STATES.EXIT }
            ]
        }
    ], function (answers) {
        changeState(answers.action);
    });
};
