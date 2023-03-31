// Dependencies
const { sample } = require('./handlers/routesHandlers/sampleHandler');
const { usersHandler } = require('./handlers/routesHandlers/usersHandler');
const { tokenHandler } = require('./handlers/routesHandlers/tokenHandler');
const { checkHandler } = require('./handlers/routesHandlers/checkHandler');

// module scaffolding
const routes = {};
routes.sample = sample;
routes.user = usersHandler;
routes.token = tokenHandler;
routes.check = checkHandler;

module.exports = routes;
