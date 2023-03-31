/* eslint-disable no-param-reassign */
const https = require('https');
const querystring = require('querystring');
const { caller, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = require('./environment');

// module scaffolding
const notification = {};

notification.twilio = (phone, messages, callback) => {
    phone = typeof phone === 'string' && phone.trim().length === 11 ? phone : false;
    messages =
        typeof messages === 'string' && messages.trim().length > 0 && messages.trim().length <= 1600
            ? messages
            : false;
    if (phone && messages) {
        // configure request payload
        const payload = {
            From: caller,
            To: `+88${phone}`,
            Body: messages,
        };

        const stringifyPayload = querystring.stringify(payload);

        // request configuration details
        const requestDetails = {
            hostname: 'api.twilio.com',
            path: `/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            method: 'POST',
            auth: `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        const req = https.request(requestDetails, (res) => {
            const { statusCode } = res;
            if (statusCode === 200 || statusCode === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${statusCode}`);
            }
        });
        req.on('error', (e) => {
            callback(e);
        });
        req.write(stringifyPayload);
        req.end();
    } else {
        callback('Given parameters were missing or invalid!');
    }
};

module.exports = notification;
