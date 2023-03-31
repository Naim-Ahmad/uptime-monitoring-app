// Dependencies
const data = require('../../lib/data');
const { parseJSON, createToken } = require('../../helpers/utilities');
const { _tokenHandler } = require('./tokenHandler');

// module scaffolding

const check = {};

check.checkHandler = (requestProperties, callback) => {
    const acceptedMethod = ['get', 'post', 'put', 'delete'];
    if (acceptedMethod.includes(requestProperties.method)) {
        check._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(404);
    }
};

check._check = {};

check._check.post = (requestProperties, callback) => {
    let { protocol, phone, method, statusCode, timeoutSeconds, url } = requestProperties.body;
    protocol =
        typeof protocol === 'string' && ['http', 'https'].includes(protocol) ? protocol : false;
    phone = typeof phone === 'string' && phone.trim().length === 11 ? phone : false;
    method =
        typeof method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].includes(method)
            ? method
            : false;
    statusCode = typeof statusCode === 'object' && statusCode instanceof Array ? statusCode : false;
    timeoutSeconds =
        typeof timeoutSeconds === 'number' &&
        timeoutSeconds >= 0 &&
        timeoutSeconds <= 5 &&
        timeoutSeconds % 1 === 0
            ? timeoutSeconds
            : false;

    url = typeof url === 'string' && url.trim().length > 0 ? url : false;

    if (protocol && phone && method && statusCode && timeoutSeconds && url) {
        const token =
            typeof requestProperties.headersObject.token === 'string' &&
            requestProperties.headersObject.token.trim().length > 0
                ? requestProperties.headersObject.token
                : false;

        if (token) {
            data.read('tokens', token, (err, tokenData) => {
                if (!err && tokenData) {
                    const userPhone = parseJSON(tokenData).phone;
                    data.read('users', userPhone, (err1, userData) => {
                        _tokenHandler.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                if (!err1 && userData) {
                                    const userObject = parseJSON(userData);
                                    const userCheck =
                                        typeof userData.check === 'object' &&
                                        userData.check instanceof Array
                                            ? userData.check
                                            : [];

                                    const checkObject = {
                                        id: createToken(20),
                                        method,
                                        protocol,
                                        statusCode,
                                        timeoutSeconds,
                                        url,
                                        phone,
                                    };

                                    data.create('checks', checkObject.id, checkObject, (err2) => {
                                        if (!err2) {
                                            userObject.check = userCheck;
                                            userObject.check.push(checkObject.id);

                                            data.update('users', phone, userObject, (err3) => {
                                                if (!err3) {
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a server side error!',
                                                        details: err3,
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a server side error!',
                                                details: err2,
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'User not found!',
                                    });
                                }
                            } else {
                                callback(401, {
                                    error: 'Authentication problem!',
                                });
                            }
                        });
                    });
                } else {
                    callback(401, {
                        error: 'Authentication problem!',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You have a problem in your request! You may wont provide token in headers!',
            });
        }
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

check._check.get = (requestProperties, callback) => {
    let { id } = requestProperties.queryObject;
    id = typeof id === 'string' && id.trim().length > 0 ? id : false;

    if (id) {
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const checkObject = parseJSON(checkData);
                _tokenHandler.verify(id, checkObject.phone, (checkDataIsValid) => {
                    if (checkDataIsValid) {
                        callback(200, { checkObject });
                    } else {
                        callback(403, {
                            error: 'Authentication Error!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'You have a problem in your request!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request!',
        });
    }
};

check._check.put = (requestProperties, callback) => {
    let { protocol, method, statusCode, timeoutSeconds, url } = requestProperties.body;
    protocol =
        typeof protocol === 'string' && ['http', 'https'].includes(protocol) ? protocol : false;

    method =
        typeof method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].includes(method)
            ? method
            : false;
    statusCode = typeof statusCode === 'object' && statusCode instanceof Array ? statusCode : false;
    timeoutSeconds =
        typeof timeoutSeconds === 'number' &&
        timeoutSeconds >= 0 &&
        timeoutSeconds <= 5 &&
        timeoutSeconds % 1 === 0
            ? timeoutSeconds
            : false;

    url = typeof url === 'string' && url.trim().length > 0 ? url : false;

    if (protocol || method || statusCode || timeoutSeconds || url) {
        const id =
            typeof requestProperties.body.id === 'string' &&
            requestProperties.body.id.trim().length > 0
                ? requestProperties.body.id
                : false;

        if (id) {
            data.read('checks', id, (err, checkData) => {
                if (!err) {
                    const checkObject = parseJSON(checkData);
                    const token =
                        typeof requestProperties.headersObject.token === 'string'
                            ? requestProperties.headersObject.token
                            : false;
                    if (token) {
                        _tokenHandler.verify(token, checkObject.phone, (isValidCheckData) => {
                            if (isValidCheckData) {
                                const inputObject = {
                                    protocol,
                                    url,
                                    method,
                                    statusCode,
                                    timeoutSeconds,
                                };
                                if (
                                    checkData.protocol !== inputObject.protocol ||
                                    checkData.url !== inputObject.url ||
                                    checkData.method !== inputObject.method ||
                                    checkData.timeoutSeconds !== inputObject.timeoutSeconds ||
                                    checkData.statusCode !== inputObject.statusCode
                                ) {
                                    if (protocol) {
                                        checkObject.protocol = protocol;
                                    }
                                    if (method) {
                                        checkObject.method = method;
                                    }
                                    if (statusCode) {
                                        checkObject.statusCode = statusCode;
                                    }
                                    if (timeoutSeconds) {
                                        checkObject.timeoutSeconds = timeoutSeconds;
                                    }
                                    if (url) {
                                        checkObject.url = url;
                                    }
                                    data.update('checks', id, checkObject, (err1) => {
                                        if (!err1) {
                                            callback(200, checkObject);
                                        } else {
                                            callback(500, {
                                                error: 'There was a server side error',
                                            });
                                        }
                                    });
                                } else {
                                    callback(400, {
                                        error: 'You may wont change anything please do some change and try update!',
                                    });
                                }
                            } else {
                                callback(403, { error: 'Authentication problem!' });
                            }
                        });
                    } else {
                        callback(400, {
                            error: 'You have a problem in your request! token may be in valid!',
                        });
                    }
                } else {
                    callback(500, { error: 'There was a problem in server side!', details: err });
                }
            });
        } else {
            callback(400, {
                error: 'You have a problem in your request!',
            });
        }
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

check._check.delete = (requestProperties, callback) => {
    let { id } = requestProperties.queryObject;
    id = typeof id === 'string' && id.trim().length > 0 ? id : false;

    if (id) {
        data.read('checks', id, (err, checkData) => {
            if (!err) {
                const checkObject = parseJSON(checkData);
                _tokenHandler.verify(id, checkObject.phone, (checkDataIsValid) => {
                    if (checkDataIsValid) {
                        data.delete('checks', id, (err1) => {
                            if (!err1) {
                                data.read('users', checkObject.phone, (err2, userData) => {
                                    if (!err2 && userData) {
                                        const userObject = parseJSON(userData);
                                        const checkArray =
                                            typeof userObject.check === 'object' &&
                                            userObject.check instanceof Array
                                                ? userObject.check
                                                : [];
                                        const arrIndex = checkArray.indexOf(id);
                                        checkArray.splice(arrIndex, 1);
                                        userObject.check = checkArray;

                                        data.update(
                                            'users',
                                            userObject.phone,
                                            userObject,
                                            (err4) => {
                                                if (!err4) {
                                                    callback(200, userObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'Error occurred in server side!',
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        callback(500, { error: 'There was a server side error!' });
                                    }
                                });
                            } else {
                                callback(500, { error: 'There was a server side problem!' });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'Authentication Error!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'You have a problem in your request!',
                    err,
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request!',
        });
    }
};

module.exports = check;
