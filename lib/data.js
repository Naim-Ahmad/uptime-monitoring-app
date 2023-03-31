// Dependencies
const fs = require('fs');
const path = require('path');

// module scaffolding
const lib = {};

lib.basedir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, callback) => {
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, (err1) => {
                if (!err1) {
                    fs.close(fileDescriptor, (err2) => {
                        if (!err2) {
                            callback(false);
                        } else {
                            callback('Error ocurred when closing file!');
                        }
                    });
                } else {
                    callback('Sorry could not write data');
                }
            });
        } else {
            callback('Could not create the file, may be already exist!');
        }
    });
};

lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fd) => {
        if (!err && fd) {
            fs.ftruncate(fd, (err1) => {
                if (!err1) {
                    const stringData = JSON.stringify(data);

                    fs.writeFile(fd, stringData, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('Error ocurred when updating the file!');
                        }
                    });
                } else {
                    callback(err1);
                }
            });
        } else {
            callback(err);
        }
    });
};

lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};

lib.list = (dir, callback) => {
    fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) => {
        if (!err && fileNames.length > 0) {
            const trimmedFileNames = [];
            fileNames.forEach((name) => {
                const replacedName = name.replace('.json', '');
                trimmedFileNames.push(replacedName);
            });
            callback(false, trimmedFileNames);
        } else {
            callback(err, fileNames);
        }
    });
};

module.exports = lib;
