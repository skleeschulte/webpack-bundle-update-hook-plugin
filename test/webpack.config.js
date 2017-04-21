/**
 * webpack config for tests
 */

var path = require('path');
var BundleUpdateHookPlugin = require('../src/plugin');

module.exports = {

    context: path.join(__dirname, 'testSources'),
    entry: './index',
    output: {
        path: '/',
        filename: 'bundle.js'
    },

    plugins: [
        new BundleUpdateHookPlugin()
    ]

};
