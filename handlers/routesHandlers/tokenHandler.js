// Dependencies
const data = require('../../lib/data');
const { parseJSON, hash, createToken } = require('../../helpers/utilities');

// Module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethod = ['get', 'post', 'put', 'delete'];
    if (acceptedMethod.includes(requestProperties.method)) {
        handler._tokenHandler[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._tokenHandler = {};

handler._tokenHandler.post = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    if (phone && password) {
        data.read('users', phone, (err, usrData) => {
            const userData = { ...parseJSON(usrData) };
            if (!err && usrData) {
                if (userData.phone === phone && userData.password === hash(password)) {
                    const token = createToken(20);
                    const tokenExpire = Date.now() + 60 * 60 * 1000;
                    const tokenObject = {
                        token,
                        expires: tokenExpire,
                        phone,
                    };
                    data.create('tokens', token, tokenObject, (err1) => {
                        if (!err1) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                error: 'Error occurred in server side!',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'You have a problem in your request!',
                    });
                }
            } else {
                callback(500, {
                    error: 'Error occurred in server side! May token already exist! or could not found user!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!',
        });
    }
};

handler._tokenHandler.get = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryObject.id === 'string' &&
        requestProperties.queryObject.id.trim().length === 20
            ? requestProperties.queryObject.id
            : false;

    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(202, token);
            } else {
                callback(404, {
                    error: 'Token was not found',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested token was not found!',
        });
    }
};

handler._tokenHandler.put = (requestProperties, callback) => {
    // check the token and extend
    let { token, extend } = requestProperties.body;

    token = typeof token === 'string' && token.trim().length === 20 ? token : false;
    extend = !!(typeof extend === 'boolean' && extend === true);

    if (token && extend) {
        data.read('tokens', token, (err, tknData) => {
            const tokenData = parseJSON(tknData);

            if ((!err, tokenData)) {
                if (tokenData.token === token && tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 60 * 60 * 1000;
                    data.update('tokens', token, tokenData, (err1) => {
                        if (!err1) {
                            callback(200, {
                                message: 'Token is successfully extends!',
                            });
                        } else {
                            callback(500, {
                                error: 'There was a problem in server side!',
                            });
                        }
                    });
                } else {
                    callback(404, {
                        error: 'Token already expired!',
                    });
                }
            } else {
                callback(500, {
                    error: err,
                    msg: 'Error occurred in server side!',
                });
            }
        });
    } else {
        callback(404, {
            message: 'There was a problem in your request!',
        });
    }
};

handler._tokenHandler.delete = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.token === 'string' &&
        requestProperties.body.token.trim().length === 20
            ? requestProperties.body.token
            : false;

    if (id) {
        data.delete('tokens', id, (err) => {
            if (!err) {
                callback(200, {
                    message: 'File was successfully deleted!',
                });
            } else {
                callback(500, {
                    error: 'Error occurred in server side!',
                });
            }
        });
    } else {
        callback(404, { error: 'Please Provide a valid token!' });
    }
};

handler._tokenHandler.verify = (id, phone, callback) => {
    const token = typeof id === 'string' && id.trim().length === 20 ? id : false;
    const phoneNum = typeof phone === 'string' && phone.trim().length === 11 ? phone : false;

    if (token && phoneNum) {
        data.read('tokens', token, (err, tData) => {
            const tokenData = parseJSON(tData);
            if (!err && tokenData.phone === phoneNum && tokenData.token === token) {
                callback(true);
            } else {
                callback(false);
            }
        });
    } else {
        callback(false);
    }
};
module.exports = handler;
