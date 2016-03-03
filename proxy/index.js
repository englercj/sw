'use strict';

require('dotenv').load({ path: '../.env' });

const http  = require('http');
const url   = require('url');
const Buffer = require('buffer').Buffer;

// create a new http proxy server
// req - http.IncomingMessage
// res - http.ServerResponse
const server = http.createServer(function (req, res) {
    // setup the request options
    const reqOptions = url.parse(req.url);
    const host = reqOptions.hostname || reqOptions.host || req.headers.host;

    reqOptions.hostname = host;
    reqOptions.method = req.method;
    reqOptions.path = reqOptions.path || reqOptions.pathname;
    reqOptions.headers = req.headers;

    // console.log(reqOptions.protocol, reqOptions.protocol === 'https:' ? 443 : 80);

    let requestChunks = [];
    let responseChunks = [];
    let trackRequest = host.startsWith('summonerswar') && host.endsWith('com2us.net') && reqOptions.path.startsWith('/api/');

    // proxyRes - http.IncomingMessage
    const proxyReq = http.request(reqOptions, (proxyRes) => {
        // pipe response back to requester
        proxyRes.pipe(res);

        // parse body of response for our own tracking if it matches a summoner request
        if (trackRequest) {
            proxyRes
                .on('data', (chunk) => {
                    responseChunks.push(chunk);
                })
                .on('end', () => {
                    requestComplete(req, Buffer.concat(requestChunks), proxyRes, Buffer.concat(responseChunks));
                });
        }
    });

    // pipe request to the target
    req.pipe(proxyReq);

    if (trackRequest) {
        // also buffer request for our own purposes
        req.on('data', (chunk) => {
            requestChunks.push(chunk);
        });
    }
});

server.listen(process.env.PORT || 8080, '0.0.0.0');

console.log('Server listening...');

function requestComplete(req, reqBody, res, resBody) {
    console.log('REQUEST:\n', req.method, req.url, '\n', req.headers, '\n\n', reqBody.toString());
    console.log('\nRESPONSE:\n', res.headers, '\n\n', resBody.toString());
    console.log('-----------------------------------');
}
