'use strict';

const crypto = require('crypto');
const zlib   = require('zlib');
const Buffer = require('buffer').Buffer;

const key = new Buffer(process.env.DECRYPTION_KEY, 'hex');

module.exports = {
    decryptRequest: function (body) {
        return _decrypt(body);
    },
    decryptResponse: function (body) {
        return zlib.inflateSync(_decrypt(body));
    }
};

function getIv() {
    return new Buffer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}

function _decrypt(msg) {
    if (!msg) {
        return new Buffer(0);
    }

    const buffer = new Buffer(msg, 'base64');
    const decipher = crypto.createDecipheriv('AES-128-CBC', key, getIv());

    decipher.setAutoPadding(false);

    const result = Buffer.concat([
        decipher.update(buffer),
        decipher.final()
    ]);

    const padding = result.readUInt8(result.length - 1);

    return result.slice(0, result.length - padding);
}
