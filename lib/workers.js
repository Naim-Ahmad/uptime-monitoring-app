/* eslint-disable no-param-reassign */
/*
 * Title: workers
 * Description: workers related files
 * Author: Niam Ahmad
 * Date: 8/3/2023
 */

// Dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { twilio } = require('../helpers/notifications');

// module scaffolding
const worker = {};

// function for gether all checks from data base
worker.getherAllChecks = () => {
    // gether all the checks
    data.list('checks', (err, fileNames) => {
        if (!err && fileNames.length > 0) {
            fileNames.forEach((check) => {
                data.read('checks', check, (error, originalData) => {
                    if (!error && originalData) {
                        worker.validate(parseJSON(originalData));
                    } else {
                        console.log('Error: could not find any of the checks data');
                    }
                });
            });
        } else {
            console.log('Error: could not fine any files in checks folder!');
        }
    });
};

worker.validate = (originalData) => {
    if (originalData && originalData.id) {
        originalData.state =
            typeof originalData.state === 'string' &&
            ['up', 'down'].indexOf(originalData.state) > -1
                ? originalData.state
                : 'down';

        originalData.lastChecked =
            typeof originalData.lastChecked === 'number' && originalData.lastChecked > 0
                ? originalData.lastChecked
                : false;

        worker.performCheck(originalData);
    } else {
        console.log('Error: cannot find any id !');
    }
};

worker.performCheck = (originalData) => {
    let checkOutCome = {
        error: false,
        responseCode: false,
    };

    // mark the outcome has not been sent yet
    let outcomeSent = false;

    // parse url
    const parsedUrl = url.parse(`${originalData.protocol}://${originalData.url}`, true);
    const { hostname } = parsedUrl;
    const { path } = parsedUrl;

    const requestDetails = {
        protocol: `${originalData.protocol}:`,
        hostname,
        path,
        timeout: originalData.timeoutSeconds * 1000,
        method: originalData.method.toUpperCase(),
    };

    const protocol = originalData.protocol === 'http' ? http : https;

    const req = protocol.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;

        // update the check outcome and pass to the next process
        checkOutCome.responseCode = status;
        if (!outcomeSent) {
            worker.processCheckOutcome(originalData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };

        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            worker.processCheckOutcome(originalData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.end();
};
// save check outcome to database and send to next process
worker.processCheckOutcome = (originalCheckData, checkOutCome) => {
    // check if check outcome is up or down
    const state =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        originalCheckData.statusCode.indexOf(checkOutCome.responseCode) > -1
            ? 'up'
            : 'down';

    // decide whether we should alert the user or not
    const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data
    const newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check to disk
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                // send the checkdata to next process
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }
        } else {
            console.log('Error trying to save check data of one of the checks!');
            console.log(err);
        }
    });
};

// send notification sms to user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
    }://${newCheckData.url} is currently ${newCheckData.state}`;

    twilio(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via SMS: ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user!');
        }
    });
};

worker.loop = () => {
    setInterval(() => {
        worker.getherAllChecks();
    }, 1000 * 60);
};

worker.init = () => {
    // lookup all the checks
    worker.getherAllChecks();

    // loop
    worker.loop();
};

module.exports = worker;
