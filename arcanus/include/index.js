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

var path = require('path');

/**
 * Prepares the arcanus framework for usage.
 *
 * @param {object} config                       The loaded arcanus configuration object.
 */
module.exports = function (config) {
    /**
     * The base arcanus object to hold the various framework elements.
     *
     * @private
     * @type {object}
     */
    var arcanus = {};

    // Store the loaded configurations..
    arcanus.config = config;

    // Prepare the arcanus utils class object..
    arcanus.utils = require(path.join(config.root_path, '/include/utils'));

    // Prepare the arcanus logging instance..
    arcanus.log = require(path.join(config.root_path, '/include/logging'))(arcanus);

    // Prepare the arcanus caching object..
    arcanus.Cache = require('node-cache');
    arcanus.cache = new arcanus.Cache({ stdTTL: 0, checkperiod: 300 });

    // Prepare the arcanus service factory..
    arcanus.services = new (require(path.join(config.root_path, '/include/services/ServiceFactory'))(arcanus));

    // Prepare the base service for services to inherit from..
    arcanus.BaseService = require(path.join(config.root_path, '/include/services/BaseService'));

    // Register internal services to arcanus..
    var ViewService = require(path.join(config.root_path, '/include/services/ViewService'))(arcanus);
    var PluginService = require(path.join(config.root_path, '/include/services/PluginService'))(arcanus);

    arcanus.services.registerService(ViewService);
    arcanus.services.registerService(PluginService);

    // Return the initialized arcanus application..
    return arcanus;
};