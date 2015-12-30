/**
 * Create a new BundleUpdateHookPlugin instance.
 * @param {Object.<string, boolean>} options Available options: { debug: true|false } (debug defaults to false)
 * @constructor
 */
function BundleUpdateHookPlugin(options) {
    options = options || {};
    this.debug = options.debug || false;
}

/**
 * Register the plugin on the 'done' hook.
 * @param compiler
 */
BundleUpdateHookPlugin.prototype.apply = function(compiler) {

    var that = this;
    var prevModules;

    // do our things after a compilation is done
    compiler.plugin('done', function(stats) {

        var debug = that.debug;

        var currModules = {};
        var newModules = {};
        var changedModules = {};
        var removedModules = {};

        stats.compilation.modules.forEach(function (module) {
            // skip modules which don't have a resource property (e.g. main module 0)
            if (!module.resource) return;

            currModules[module.id] = {
                buildTimestamp: module.buildTimestamp,
                resource: module.resource
            };

            // if prevModules exists, check if current module is new or has changed
            if (prevModules) {
                if (!prevModules[module.id]) {
                    // current module is new
                    if (debug) console.log('[webpack-bundle-update-hook-plugin] detected new module: ' +
                        module.resource);
                    newModules[module.id] = module.resource;
                } else if (prevModules[module.id].buildTimestamp !== module.buildTimestamp) {
                    // current module has changed
                    if (debug) console.log('[webpack-bundle-update-hook-plugin] detected changed module: ' +
                        module.resource);
                    changedModules[module.id] = module.resource;
                }
            }
        });

        // if prevModules exists, check for removed modules
        if (prevModules) {
            Object.keys(prevModules).forEach(function (id) {
                if (!currModules[id]) {
                    // module was removed
                    if (debug) console.log('[webpack-bundle-update-hook-plugin] detected removed module: ' +
                        prevModules[id].resource);
                    removedModules[id] = prevModules[id].resource;
                }
            });
        }

        prevModules = currModules;

        var newModulesCount = Object.getOwnPropertyNames(newModules).length;
        var changedModulesCount = Object.getOwnPropertyNames(changedModules).length;
        var removedModulesCount = Object.getOwnPropertyNames(removedModules).length;

        // if anything changed, emit bundle-update event
        if (newModulesCount !== 0 || changedModulesCount !== 0 || removedModulesCount !== 0) {
            if (debug) console.log('[webpack-bundle-update-hook-plugin] a new bundle was compiled (' +
                newModulesCount + ' new, ' + changedModulesCount + ' changed, ' + removedModulesCount +
                ' removed modules) - emitting bundle-update');
            this.applyPlugins('bundle-update', newModules, changedModules, removedModules, stats);
        } else {
            if (debug) console.log('[webpack-bundle-update-hook-plugin] a new bundle was compiled but nothing changed' +
                ' (this will always apply to the first compilation)');
        }

    });

};

module.exports = BundleUpdateHookPlugin;
