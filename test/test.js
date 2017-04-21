/**
 * Test webpack-bundle-update-hook-plugin with webpack. Webpack entry is
 * configured to ./testSources/index.js. Webpack compiler is run in watch mode
 * with node api. As modules are added in testSources, bundle-update event must
 * fire accordingly. Output is written to memory fs.
 */

var assert = require('chai').assert;
var EventEmitter = require('events');
var MemoryFS = require('memory-fs');
var testSrc = require('./testSources');
var util = require('util');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

// init test sources
testSrc.init();

// The tapable api does not provide a way to remove a plugin, so we wrap it
// in our own event EventEmitter.
function WebpackEmitter() {
    EventEmitter.call(this);
}
util.inherits(WebpackEmitter, EventEmitter);
var webpackEmitter = new WebpackEmitter();

// configure webpack to use memory file system for output and plug into
// bundle-update hook
var fs = new MemoryFS();
var webpackCompiler = webpack(webpackConfig);
webpackCompiler.outputFileSystem = fs;
webpackCompiler.plugin('bundle-update', function (newModules, changedModules, removedModules, stats) {
    webpackEmitter.emit('bundle-update', newModules, changedModules, removedModules, stats);
});

describe('webpack-bundle-update-hook-plugin', function () {

    // give the file watcher plenty of time to detect changes
    this.slow(1000);
    this.timeout(5000);

    it('should emit new and changed modules when require statements (and thus modules) are added', function (done) {
        var bundleUpdateListener = function (newModules, changedModules, removedModules) {
            var newModulesIds = Object.keys(newModules);
            assert.equal(newModulesIds.length, 1);
            assert.equal(newModules[newModulesIds[0]], testSrc.getModulePath('module.js'));

            var changedModulesIds = Object.keys(changedModules);
            assert.equal(changedModulesIds.length, 1);
            assert.equal(changedModules[changedModulesIds[0]], testSrc.getModulePath('index.js'));

            assert.deepEqual(removedModules, {});

            done();
        };
        webpackEmitter.once('bundle-update', bundleUpdateListener);

        testSrc.addModule('module.js');
    });

    it('should emit changed modules when modules source code changes', function (done) {
        var bundleUpdateListener = function (newModules, changedModules, removedModules) {
            assert.deepEqual(newModules, {});

            var changedModulesIds = Object.keys(changedModules);
            assert.equal(changedModulesIds.length, 1);
            assert.equal(changedModules[changedModulesIds[0]], testSrc.getModulePath('module.js'));

            assert.deepEqual(removedModules, {});

            done();
        };
        webpackEmitter.once('bundle-update', bundleUpdateListener);

        testSrc.updateModuleSrc('module.js', 'var x = 1;');
    });

    it('should emit changed and removed modules when require statements (and thus modules) are removed', function (done) {
        var bundleUpdateListener = function (newModules, changedModules, removedModules) {
            assert.deepEqual(newModules, {});

            var changedModulesIds = Object.keys(changedModules);
            assert.equal(changedModulesIds.length, 1);
            assert.equal(changedModules[changedModulesIds[0]], testSrc.getModulePath('index.js'));

            var removedModulesIds = Object.keys(removedModules);
            assert.equal(removedModulesIds.length, 1);
            assert.equal(removedModules[removedModulesIds[0]], testSrc.getModulePath('module.js'));

            done();
        };
        webpackEmitter.once('bundle-update', bundleUpdateListener);

        testSrc.removeModule('module.js');
    })

});
