#!/usr/bin/env node

'use strict';

const argv      = require('minimist')(process.argv.slice(2));
const Loki      = require('lokijs');
const data      = require('./lib/data');
const db        = new Loki('monsters.db');

db.loadDatabase({}, function () {
    let store = db.getCollection('monsters') || db.addCollection('monsters', data.collectionSettings);

    handleState(data.STATES.MENU);

    function handleState(state, err) {
        db.saveDatabase(function () {
            if (state === data.STATES.EXIT)
                return process.exit(0);

            if (state === data.STATES.ERROR) {
                console.error(err);
                state = data.STATES.MENU;
            }

            require(`./actions/${state}`)(argv, db, store, handleState);
        });
    }
});
