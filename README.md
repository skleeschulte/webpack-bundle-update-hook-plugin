# webpack-bundle-update-hook-plugin

Add a tapable 'bundle-update' hook to webpack. On bundle updates registered plugins get lists of new, changed and removed modules.

This plugin can be useful in combination with [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) or [webpack-dev-server](https://github.com/webpack/webpack-dev-server). The plugin adds a new hook `bundle-update` to which other plugins can register. After each bundle update, registered plugins receive lists of new, changed and removed files. These can for example be used for server side hot module reloading.

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
        // newModules, changedModules and removedModules are objects. The properties of the objects
        // are module ids, the values of these properties are the corresponding module resources
        // (= absolute module paths).

        // stats is passed as is from the compilers 'done' plugin hook.

        console.log('new modules: ', newModules);
        console.log('changed modules: ', changedModules);
        console.log('removed modules: ', removedModules);
    });

Note: The `bundle-update` event will only be emitted if there was a change (a module added, changed or removed). Thus, the event will never be emitted after the first build.

## How it works

The plugin hooks into the [webpack compiler's `done` hook](https://webpack.github.io/docs/plugins.html#the-compiler-instance). The `done` event is fired whenever webpack has finished a build. The callback function receives a `stats` object which contains a list of all the modules in the current bundle in `stats.compilation.modules`. Each module has (among others) an `id` property and a `buildTimestamp` property. Resource modules (non webpack internal modules) also have a `resource` property.

On each `done` event, the plugin generates a list of module ids and buildTimestamps, skipping modules that don't have a resource property. For the first build, nothing else is done. For subsequent builds, the previous list is compared to the current list: missing module ids on the old list identify new modules, missing module ids on the new list identify removed modules, same module id and different buildTimestamp identifies changed modules.

## Options

### debug

Debug output can be enabled by setting the debug flag in the plugin options to true:

    new BundleUpdateHookPlugin({ debug: true })

## License

MIT (see LICENSE file)
