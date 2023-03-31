/* eslint-disable no-mixed-operators */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */
/* eslint-disable comma-dangle */
// Dependencies

const { hash, parseJSON } = require('../../helpers/utilities');
const data = require('../../lib/data');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const users = {};

users.usersHandler = (requestProperties, callback) => {
    const acceptedMethod = ['post', 'get', 'put', 'delete'];

    if (acceptedMethod.includes(requestProperties.method)) {
        users._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

users._users = {};

users._users.post = (requestProperties, callback) => {
    let {
 firstName, lastName, phone, password, tosAgreement
} = requestProperties.body;

     firstName = typeof firstName === 'string' && firstName.trim().length > 0 ? firstName : false;
     lastName = typeof lastName === 'string' && lastName.trim().length > 0 ? lastName : false;
     phone = typeof phone === 'string' && phone.trim().length === 11 ? phone : false;
     password =
        typeof password === 'string' && password.trim().length > 0 ? password : false;
    tosAgreement = typeof tosAgreement === 'boolean' && tosAgreement ? tosAgreement : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        data.read('users', phone, (err) => {
            if (err) {
                const usrObj = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement
                };

                data.create('users', phone, usrObj, (err1) => {
                    if (!err1) {
                        callback(200, { message: 'User Create Successfully!' });
                    } else {
                        callback(500, { error: 'Could not create user!' });
                    }
                });
            } else {
                callback(500, {
                    error: 'error on server side',

                });
          }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

users._users.get = (requestProperties, callback) => {
    let { phone } = requestProperties.queryObject;
    phone = typeof phone === 'string' && phone.trim().length === 11 ? phone : false;

    if (phone) {
        const token = typeof requestProperties.headersObject.token === 'string' && requestProperties.headersObject.token.trim().length > 0 ? requestProperties.headersObject.token : false;

        if (token) {
            tokenHandler._tokenHandler.verify(token, phone, (tokenVerify) => {
                if (tokenVerify) {
                    data.read('users', phone, (err, usr) => {
                    if (!err && usr) {
                        const user = parseJSON(usr);
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, {
                            error: 'Requested user not found!1'
                });
        }
    });
                } else {
                    callback(403, {
                        error: 'Authentication Problem!'
                    });
                }
        });
        } else {
            callback(404, {
            error: 'You have a problem in your request!',
        });
        }
    } else {
        callback(404, {
            error: 'You have a problem in your request!',

        });
   }
};

users._users.put = (requestProperties, callback) => {
    // check the phone number if valid
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;

    if (firstName && lastName && password) {
        if (firstName || lastName || password) {
            tokenHandler._tokenHandler.verify(requestProperties.headersObject.token, phone, (verify) => {
                if (verify) {
                    data.read('users', phone, (err1, uData) => {
                        const userData = { ...parseJSON(uData) };
                        const inputData = { firstName, lastName, password: hash(password) };

                if (!err1 && inputData.firstName !== userData.firstName || inputData.lastName !== userData.lastName || inputData.password !== userData.password) {
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = hash(password);
                    }

                    data.update('users', phone, userData, (err2) => {
                        if (!err2) {
                            delete userData.password;
                            callback(200, {
                                message: 'User was updated successfully!',
                                updatedObject: userData
                            });
                        } else {
                            callback(500, {
                                error: 'There was a problem in the server side!',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: "You haven't update anything! please some change than update the profile!",
                    });
                }
            });
                 } else {
                    callback(500, {
                       error: 'There was a server side error'
                   });
               }
           });
        } else {
            callback(400, {
                error: 'You have a problem in your request!',
            });
        }
    } else {
        callback(400, {
            error: 'Invalid phone number. Please try again!',
        });
    }
};

users._users.delete = (requestProperties, callback) => {
    const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
    if (phone) {
        tokenHandler._tokenHandler.verify(requestProperties.headersObject.token, phone, (verify) => {
            if (verify) {
                data.read('users', phone, (err, udata) => {
            if (!err && udata) {
                data.delete('users', phone, (err1) => {
                    if (!err1) {
                        callback(200, {
                            message: 'You have successfully delete data'
                        });
                    } else {
                        callback(500, {
                            error: 'Error occurred in server side!'
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'Error occurred in server side'
                });
            }
        });
             } else {
                callback(500, {
                    error: 'Server side error!'
                });
            }
        });
    } else {
        callback(404, {
            error: 'Invalid request please try again!'
        });
    }
};

module.exports = users;
