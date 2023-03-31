/*
 * Title: uptime-monitoring-app
 * Description: for monitoring url
 * Author: Niam Ahmad
 * Date: 8/3/2023
 */

// Dependencies
const worker = require('./lib/workers');
const server = require('./lib/server');

// module scaffolding
const app = {};

app.init = () => {
    server.init();

    worker.init();
};

app.init();
