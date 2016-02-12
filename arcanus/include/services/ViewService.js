/**
 * arcanus - Copyright (C) 2015-2016 atom0s [atom0s@live.com]
 *
 * This unpublished material is proprietary to atom0s.
 * All rights reserved.
 *
 * The methods and techniques described herein are considered trade secrets
 * and/or confidential. Reproduction or distribution, in whole or in part,
 * is forbidden except by express written permission of atom0s.
 */

"use strict";

var fs = require('fs');
var path = require('path');

/**
 * View Service
 *
 * Exposes functions related to view handling.
 *
 * @param {object} arcanus                          The arcanus application instance.
 */
module.exports = function ViewServiceModule(arcanus) {
    /**
     * Implements the view service.
     *
     * @constructor
     */
    function ViewService() {
        // Initialize the base service class..
        arcanus.BaseService.call(this);
    }

    // Inherit from the base service class (required!)..
    ViewService.prototype = Object.create(arcanus.BaseService.prototype);
    ViewService.constructor = arcanus.BaseService;

    /**
     * Returns the alias of the current service. (Must be overridden!)
     *
     * @returns {string}                            The alias of the current service.
     */
    ViewService.prototype.getAlias = function () {
        return 'viewservice';
    };

    /**
     * Initializes the current service. (Must be overridden!)
     *
     * @param {function} done                       The callback to invoke when finished.
     */
    ViewService.prototype.Initialize = function (done) {
        done(null, true);
    };

    /**
     * Determines the best match view file to load when a view is being rendered.
     *
     * Order in which views are looked for is:
     *      1. Calling plugins views.
     *      2. Loaded plugin views.
     *      3. Base arcanus views.
     *
     * @param {string} view                         The view being loaded to render.
     * @param {string} callerPath                   The file path that invoked the render call.
     * @returns {string}                            The best match view path.
     */
    ViewService.prototype.getBestMatchView = function (view, callerPath) {
        // If we are not called by a plugin, return the current view path..
        if (callerPath.indexOf('plugins') === -1) {
            return view;
        }

        // Obtain the plugin name..
        var pluginName = callerPath.match(/plugins\\([\w.-]+)\\/)[1] || null;
        if (!pluginName)
            return view;

        // 1. Check the calling plugins views for a valid file..
        if (fs.existsSync(path.join(arcanus.config.root_path, 'plugins', pluginName, 'views', view + '.html'))) {
            return path.join(pluginName, 'views', view);
        }

        // 2. Check all other plugin directories for a valid file..
        var dirs = arcanus.app.get('views');
        for (var x = 0; x < dirs.length; x++) {
            if (fs.existsSync(path.join(dirs[x], view + '.html'))) {
                return path.join(dirs[x], view);
            }
        }

        // No best match found.. return the requested view..
        return view;
    };

    // Return the view service..
    return ViewService;
};