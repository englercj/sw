'use strict';

const merge = require('merge');

module.exports = function (db, store, obj, isAdd) {
    let val = store.by('postId', obj.postId)

    if (val) {
        let c = val.count;
        merge(val, obj);
        val.count = isAdd ? c + 1 : c;

        store.update(val);
    }
    else {
        obj.count = 1;
        store.insert(obj);
    }
};
