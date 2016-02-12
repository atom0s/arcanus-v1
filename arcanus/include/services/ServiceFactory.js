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

var BaseService = require('./BaseService');

/**
 * Service Factory
 *
 * Container object to hold registered services for usage within arcanus.
 *
 * @param {object} arcanus                          The arcanus application instance.
 */
module.exports = function ServiceFactoryModule(arcanus) {
    /**
     * Array of loaded services within the service factory.
     *
     * @type {Array}
     */
    var LOADED_SERVICES = {};

    /**
     * Implements the service factory.
     *
     * @constructor
     */
    function ServiceFactory() { }

    /**
     * Registers a service with the service factory.
     *
     * If a service with the same alias already exists, it will be overridden.
     *
     * @param {object} service                      The service to register.
     * @returns {boolean}                           True on success, false otherwise.
     */
    ServiceFactory.prototype.registerService = function (service) {
        try {

            // Create a new instance of the incoming service..
            var instance = new service;

            // Ensure the service inherits from the BaseService object..
            if (!(instance instanceof BaseService)) {
                arcanus.log.error('ServiceFactory: Failed to register new service; invalid base class type.');
                return false;
            }

            // Obtain the services name..
            var name = instance.getAlias();
            if (!arcanus.utils.isNonEmptyString(name)) {
                arcanus.log.error('ServiceFactory: Failed to register new service; invalid service name.');
                return false;
            }

            // Initialize the service..
            instance.Initialize(function (err, status) {
                if (err || status === false) {
                    arcanus.log.error(`ServiceFactory: Failed to register new service; '${name}' service failed to initialize.`);
                    return false;
                }

                // Store the service instance..
                LOADED_SERVICES[name.toLowerCase()] = instance;
                arcanus.log.info(`ServiceFactory: Registered new service: '${name}'`);
                return true;
            });
        } catch (e) {
            console.log.error('ServiceFactory: Failed to register service. Exception occurred.');
            console.log.error(e);
            return false;
        }
    };

    /**
     * Obtains a registered service from the factory.
     *
     * @param {string} name                         The name of the service to obtain.
     * @returns {object}                            The service object if found, null otherwise.
     */
    ServiceFactory.prototype.get = function (name) {
        return LOADED_SERVICES[name.toLowerCase()] || null;
    };

    // Return the service factory..
    return ServiceFactory;
};