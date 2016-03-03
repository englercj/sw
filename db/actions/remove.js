'use strict';

const inquirer  = require('inquirer');

const data      = require('../lib/data');

module.exports = function (argv, db, store, changeState) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'query',
            message: 'Search term:'
        }
    ], function (answers) {
        const where = { '$regex': new RegExp(answers.query, 'i') };
        const results = store.find({
            '$or': [
                { name: where },
                { awakenedName: where },
                { type: where }
            ]
        });

        if (!results.length) {
            console.log('No results found.');
            return changeState(data.STATES.MENU);
        }

        let choices = results.map((v) => {
            let c = v.count > 1 ? '(' + v.count + ') ' : '';
            return {
                name: `${c}${v.type} - ${v.name} (${v.awakenedName})`,
                value: v
            };
        });

        choices.push(new inquirer.Separator());
        choices.push({ name: 'Cancel', value: null });

        inquirer.prompt([
            {
                type: 'list',
                name: 'monster',
                message: 'Choose monster to remove:',
                choices: choices
            }
        ], function (answers) {
            const obj = answers.monster;

            if (obj) {
                if (obj.count > 1) {
                    obj.count--;
                }
                else {
                    store.remove(obj);
                }
                console.log('Monster removed.');
            }

            changeState(data.STATES.MENU);
        });
    });
};
