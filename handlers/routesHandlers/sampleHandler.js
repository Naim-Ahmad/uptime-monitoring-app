// module scaffolding
const sampleHandler = {};

sampleHandler.sample = (requestProperties, callback) => {
    callback(200, {
        name: 'naim',
        age: 25,
    });
    console.log('sample handler function');
};

module.exports = sampleHandler;
