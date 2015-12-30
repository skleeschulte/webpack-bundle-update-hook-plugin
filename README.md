# webpack-bundle-update-hook-plugin

Add a tapable 'bundle-update' hook to webpack. On bundle updates registered plugins get lists of new, changed and removed modules.

This plugin can be useful in combination with [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) or [webpack-dev-server](https://github.com/webpack/webpack-dev-server). The plugin adds a new hook `bundle-update` to which other plugins can register. After each bundle update, registered plugins receive lists of new, changed and removed files.

## Installation

    npm install --save-dev webpack-bundle-update-hook-plugin

## Usage

Add the plugin to your `webpack.config.js` file:

    var BundleUpdateHookPlugin = require('webpack-bundle-update-hook-plugin');

    module.exports = {

        // ...

        plugins: [
            // ...
            new BundleUpdateHookPlugin()
        ]

    };

Then use [webpack's Node.js API](https://webpack.github.io/docs/node.js-api.html) to get a compiler with this configuration. The compiler exposes the [tapable API](https://github.com/webpack/tapable) for registering plugins. With the webpack-bundle-update-hook-plugin you can now create plugins for the hook `bundle-update`:

    var webpack = require('webpack');
    var webpackConfig = require('./webpack.config');

    var compiler = webpack(webpackConfig);

    compiler.plugin('bundle-update', function (newModules, changedModules, removedModules, stats) {
        // newModules, changedModules and removedModules are objects. The properties of the objects are module ids, the
        // values of these properties are the corresponding module resources (= absolute module paths).

        // stats is passed as is from the compilers 'done' plugin hook.

        console.log('new modules: ', newModules);
        console.log('changed modules: ', changedModules);
        console.log('removed modules: ', removedModules);
    });

## License

MIT (see LICENSE file)