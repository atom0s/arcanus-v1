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
module.exports = function Logger(arcanus) {
    // Ensure the logging configurations exist..
    if (!utils.isObject(arcanus.config.logging))
        arcanus.config.logging = {};

    // Ensure the logging level is a string..
    if (!utils.isString(arcanus.config.logging.level))
        arcanus.config.logging.level = 'debug';

    // Set the default winston transports..
    arcanus.config.logging.transports = [
        new (winston.transports.Console)({ level: arcanus.config.logging.level, timestamp: true, label: '!' })
    ];

    // Create a file transport if the configuration has a log file set..
    if (utils.isNonEmptyString(arcanus.config.logging.file)) {
        // Ensure the path to the log file exists..
        utils.mkdirSync(path.join(arcanus.config.logging.path, arcanus.config.logging.file), true);

        // Create the file transport..
        var fileTransport = new (winston.transports.File)({
            filename: path.join(arcanus.config.logging.path, arcanus.config.logging.file),
            level: arcanus.config.logging.level,
            timestamp: true
        });
        arcanus.config.logging.transports.push(fileTransport);
    }

    // Initialize winston..
    var logger = new (winston.Logger)({
        transports: arcanus.config.logging.transports,
        level: arcanus.config.logging.level,
        padLevels: true
    });

    // Implement log streaming..
    logger.stream = {
        write: function (msg) {
            logger.info(msg.trim());
        }
    };

    // Return the configured logging object..
    return logger;
};