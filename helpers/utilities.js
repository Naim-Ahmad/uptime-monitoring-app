/*
 * Title: utilities function
 * Description: utilities function of this application
 * Author: Naim Ahmad
 * Date: 8/3/2023
 */

// Dependencies
const { createHmac } = require('crypto');
const environment = require('./environment');

// module scaffolding
const utilities = {};

utilities.parseJSON = (string) => {
    let output;
    try {
        output = JSON.parse(string);
    } catch {
        output = {};
    }
    return output;
};

utilities.hash = (str) => {
    let hash;
    if (typeof str === 'string' && str.length > 0) {
        hash = createHmac('sha256', environment.key).update(str).digest('hex');
    }
    return hash;
};

utilities.createToken = (stringLength) => {
    let output = '';
    if (typeof stringLength === 'number' && stringLength > 0) {
        const char = 'abcdefghijklmnopqrstuvwxyz1234567890';
        for (let i = 0; i < stringLength; i++) {
            output += char[Math.floor(Math.random() * char.length)];
        }
    }
    return output;
};

module.exports = utilities;
