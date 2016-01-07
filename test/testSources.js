/**
 * Functions for modifying files in testSources directory
 */

var fs = require('fs');
var path = require('path');

var basePath = path.join(__dirname, 'testSources');
var modules = [];

function removeAllFiles () {
    fs.readdirSync(basePath).forEach(function (file) {
        var currPath = path.join(basePath, file);
        if(fs.lstatSync(currPath).isDirectory()) return;
        fs.unlinkSync(currPath);
    });
}

function writeFile(filename, content) {
    var filePath = path.join(basePath, filename);
    fs.writeFileSync(filePath, content, 'utf8');
}

function removeFile(filename) {
    var filePath = path.join(basePath, filename);
    fs.unlinkSync(filePath);
}

function updateIndexJs() {
    var source = modules.map(function (filename) {
        return 'require(\'./' + filename + '\');';
    }).join('\n');
    writeFile('index.js', source);
}

exports.init = function () {
    removeAllFiles();
    writeFile('index.js', '');
}

exports.addModule = function (filename) {
    writeFile(filename, '');
    modules.push(filename);
    updateIndexJs();
}

exports.removeModule = function (filename) {
    removeFile(filename);
    modules = modules.filter(function (f) { return f !== filename; });
    updateIndexJs();
}

exports.updateModuleSrc = writeFile;

exports.getModulePath = function (filename) {
    return path.join(basePath, filename);
}
