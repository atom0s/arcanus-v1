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
var utils = require('./utils.js');

/**
 * Implements functions related to configuration file usage within arcanus.
 *
 * @constructor
 */
function Configuration() { }

/**
 * The root path to the arcanus folder. (Where arcanus.js is located.)
 *
 * @readonly
 * @static
 * @type {string}
 */
Configuration.DOCUMENT_ROOT = __dirname.substr(0, __dirname.indexOf(path.sep + 'include'));

/**
 * The path where log files will be stored.
 *
 * @static
 * @readonly
 * @type {string}
 */
Configuration.LOG_DIRECTORY = path.join(Configuration.DOCUMENT_ROOT, 'log');

/**
 * The log file that logging will be output to.
 *
 * @static
 * @readonly
 * @type {string}
 */
Configuration.LOG_FILE_NAME = 'arcanus.log';

/**
 * The default configuration file name.
 *
 * @static
 * @readonly
 * @type {string}
 */
Configuration.CONFIG_FILE_NAME = 'config.js';

/**
 * The default paths to look for an arcanus configuration file.
 *
 * @type {Array}
 */
Configuration.CONFIG_FILE_PATHS = [
    path.join(Configuration.DOCUMENT_ROOT, Configuration.CONFIG_FILE_NAME)
];

/**
 * The default arcanus configurations to use if none are loaded.
 *
 * @private
 * @readonly
 * @static
 * @type {object}
 */
var DEFAULT_ARCANUS_CONFIG = {

    root_path: Configuration.DOCUMENT_ROOT,

    server: {
        host: '0.0.0.0',
        port: process.env.PORT || '80'
    },

    site: {
        name: 'arcanus',
        path: 'http://localhost/',
        meta: {
            description: 'A Node.js website framework that is extendable through plugins.',
            keywords: 'arcanus, node, nodejs, plugins, framework'
        },
        cookieSecret: 'DefaultArcanusCookieSecret'
    },

    logging: {
        path: Configuration.LOG_DIRECTORY,
        file: Configuration.LOG_FILE_NAME,
        level: 'debug',
        showErrors: true
    },

    plugins: {
        failOnLoad: true,
        enabled: [],

        // Array of loaded plugin configurations..
        __loadedPluginConfigurations: [],

        /**
         * Obtains a plugins specific configurations.
         *
         * @param {string} uid                      The unique id of the plugin.
         * @returns {object|null}                   The plugins configurations if found, null otherwise.
         */
        get: function (uid) {
            return this.__loadedPluginConfigurations[uid] || null;
        }
    }
};

/**
 * Merges the given object with the default arcanus configurations.
 *
 * @private
 * @static
 * @param {object} config                           The configuration object.
 * @returns {object}                                The new configuration object.
 */
Configuration.mergeWithDefaults = function (config) {
    return utils.deepMerge(config, DEFAULT_ARCANUS_CONFIG);
};

/**
 * Loads the configuration file for arcanus.
 *
 * @param {(Array|string)=} f                       The file path(s) to look for the arcanus configuration file.
 * @returns {object}                                The loaded configurations.
 */
Configuration.load = function (f) {
    // Check if the incoming param is a string..
    if (utils.isString(f)) {
        f = [f];
    } else if (!f) {
        f = Configuration.CONFIG_FILE_PATHS;
    }

    var config = null;
    for (var x = 0; x < f.length; x++) {
        if (fs.existsSync(f[x])) {
            try {
                config = require(f[x]);
                break;
            } catch (e) {
                console.log('Configuration: Failed to use a configuration file: [%s]: %s', f[x], e.stack);
            }
        }
    }

    // Merge the configurations with the defaults..
    return Configuration.mergeWithDefaults(config);
};

// Export this module..
module.exports = Configuration;