/*
 * Title: create server
 * Description: server related files
 * Author: Niam Ahmad
 * Date: 8/3/2023
 */

// Dependencies
const http = require('http');

const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environment');

// module scaffolding
const server = {};

server.createServer = () => {
    const createServer = http.createServer(server.handleReqRes);
    createServer.listen(server.environment.port, () => {
        console.log(`Server is running on ${server.environment.port} port...`);
    });
};

server.environment = environment;

server.handleReqRes = handleReqRes;

server.init = () => {
    server.createServer();
};

module.exports = server;
