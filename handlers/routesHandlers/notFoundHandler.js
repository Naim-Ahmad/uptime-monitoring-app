// module scaffolding
const notFoundHandler = {};
notFoundHandler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        messages: 'The page is not found what you request',
    });
    console.log('This is not found handler');
};

module.exports = notFoundHandler;
