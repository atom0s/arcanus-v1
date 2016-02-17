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
var utils = require('./utils.js');
var winston = require('winston');

/**
 * Implements logging functionality for use within arcanus.
 *
 * @param {object} arcanus                          The arcanus application instance.
 */
module.exports = function LoggerModule(arcanus) {
    /**
     * Logger class constructor.
     *
     * @constructor
     */
    function Logger() {
        var self = this;

        // Obtain the debug output level to use..
        var debugLevel = process.env.DEBUG_LEVEL || 'debug';

        // Setup the default winston transports..
        this.transports = [
            new (winston.transports.Console)({ colorize: true, level: debugLevel, timestamp: false, label: '' })
        ];

        // Setup the path to the arcanus log file..
        arcanus.utils.mkdirSync(path.join(__dirname, '..', 'logs', 'arcanus.log'), true);

        // Setup the file transport to log to disk..
        var fileTransport = new (winston.transports.File)({
            filename: path.join(__dirname, '..', 'logs', 'arcanus.log'),
            level: debugLevel,
            timestamp: true
        });
        this.transports.push(fileTransport);

        // Initialize winston..
        this.logger = new (winston.Logger)({
            transports: this.transports,
            level: debugLevel,
            padLevels: true
        });

        // Implement log streaming for request logging..
        this.logger.stream = {
            write: function (msg) {
                self.logger.info(msg.trim());
            }
        };
    }

    /**
     * Returns the underlying logger object.
     *
     * @returns {object}                            The winston logger object.
     */
    Logger.prototype.get = function () {
        return this.logger;
    };

    // Return the logger module..
    return Logger;
};