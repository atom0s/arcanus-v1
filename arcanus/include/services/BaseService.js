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

/**
 * Implements the base service class that all services must inherit.
 *
 * @constructor
 */
function BaseService() { }

/**
 * Returns the alias of the current service. (Must be overridden!)
 *
 * @returns {string}                                The alias of the current service.
 */
BaseService.prototype.getAlias = function () {
    throw new Error('Services must override the "getAlias" function!');
};

/**
 * Initializes the current service. (Must be overridden!)
 *
 * @param {function} done                           The callback to invoke when finished.
 */
BaseService.prototype.Initialize = function (done) {
    throw new Error('Services must override the "Initialize" function!');
};

// Export the base service..
module.exports = BaseService;