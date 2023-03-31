/* eslint-disable no-param-reassign */
// Dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routesHandlers/notFoundHandler');
const { parseJSON } = require('./utilities');

const handleReqRes = {};

handleReqRes.handleReqRes = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const queryObject = parsedUrl.query;
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const { headers } = req;

    const requestProperties = {
        parsedUrl,
        queryObject,
        path,
        trimmedPath,
        headersObject: headers,
        method,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();

        requestProperties.body = parseJSON(realData);

        chosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};

            const stringData = JSON.stringify(payload);
            res.setHeader('Content-Type', 'application/json');
            res.writeHeader(statusCode);
            res.end(stringData);
        });
    });
};

module.exports = handleReqRes;
