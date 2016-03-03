'use strict';

var data = module.exports = {
    rgxCleanup: /!!ASP(START|END)!!/g,

    star: '★',

    STATES: {
        ADD: 'add',
        REMOVE: 'remove',
        LIST: 'list',
        MENU: 'menu',
        ERROR: 'error',
        UPDATE: 'update',
        EXIT: 'exit'
    },

    CATEGORIES: {
        STAR_2: 93,
        STAR_3: 94,
        STAR_4: 91,
        STAR_5: 90,
        ARENA_DEFENSE: 89,
        ARENA_OFFENSE: 95,
        BLOG: 3,
        DARK: 75,
        DUNGEON: 96,
        FIRE: 72,
        FOOD: 88,
        KEEPER: 97,
        LIGHT: 76,
        MONSTERS: 81,
        UNCATEGORIZED: 1,
        WATER: 80,
        WIND: 74
    },

    collectionSettings: {
        indices: ['name'],
        unique: ['postId', 'awakenedName'],
        disableChangesApi: true
    },

    getRequestOptions: function (query) {
        return {
            url: 'http://summonerswar.co/wp-admin/admin-ajax.php',
            timeout: 30000,
            form: {
                action: 'ajaxsearchpro_search',
                aspp: query, // search term
                asid: 1,
                asp_inst_id: '1_1',
                options: {
                    qtranslate_lang: 0,
                    set_intitle: 'None',
                    set_incontent: 'None',
                    set_inposts: 'None',
                    set_inpages: 'None',
                    categoryset: data.CATEGORIES.MONSTERS
                },
                asp_preview_options: 0
            }
        };
    }
};

data.CATEGORIES.ALL = Object.keys(data.CATEGORIES).map((k) => data.CATEGORIES[k]);
