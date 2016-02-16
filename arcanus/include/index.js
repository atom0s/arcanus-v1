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
 */
module.exports = function () {
    /**
     * The base arcanus object to hold the various framework elements.
     *
     * @private
     * @type {object}
     */
    var arcanus = {};

    // Prepare the arcanus utils class object..
    arcanus.utils = require(path.join(__dirname, 'utils'));

    // Prepare the arcanus logging instance..
    arcanus.Logger = require(path.join(__dirname, 'logging'))(arcanus);
    arcanus.log = new arcanus.Logger().get();

    // Display the arcanus header..
    var arcanusVersion = require('../package.json').version;
    arcanus.log.info('-------------------------------------------------------------------------');
    arcanus.log.info(`arcanus v${arcanusVersion} (c) 2015-2016 atom0s [atom0s@live.com]`);
    arcanus.log.info('-------------------------------------------------------------------------');

    // Store the loaded configurations..
    arcanus.Configuration = require(path.join(__dirname, 'config'))(arcanus);
    arcanus.config = new arcanus.Configuration().get();

    // Prepare the arcanus caching object..
    arcanus.Cache = require('node-cache');
    arcanus.cache = new arcanus.Cache({ stdTTL: 0, checkperiod: 300 });

    // Prepare the arcanus service factory..
    arcanus.services = new (require(path.join(__dirname, 'services/ServiceFactory'))(arcanus));

    // Prepare the base service for services to inherit from..
    arcanus.BaseService = require(path.join(__dirname, 'services/BaseService'));

    // Register internal services to arcanus..
    var MenuService = require(path.join(__dirname, 'services/MenuService'))(arcanus);
    var PluginService = require(path.join(__dirname, 'services/PluginService'))(arcanus);
    var ViewService = require(path.join(__dirname, 'services/ViewService'))(arcanus);

    arcanus.services.registerService(MenuService);
    arcanus.services.registerService(PluginService);
    arcanus.services.registerService(ViewService);

    // Return the initialized arcanus application..
    return arcanus;
};