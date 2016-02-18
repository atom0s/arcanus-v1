/**
 * arcanus - Copyright (c) 2015-2016 atom0s [atom0s@live.com]
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/ or send a letter to
 * Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 *
 * By using arcanus, you agree to the above license and its terms.
 *
 *      Attribution - You must give appropriate credit, provide a link to the license and indicate if changes were
 *                    made. You must do so in any reasonable manner, but not in any way that suggests the licensor
 *                    endorses you or your use.
 *
 *   Non-Commercial - You may not use the material (arcanus) for commercial purposes.
 *
 *   No-Derivatives - If you remix, transform, or build upon the material (arcanus), you may not distribute the
 *                    modified material. You are, however, allowed to submit the modified works back to the original
 *                    arcanus project in attempt to have it added to the original project.
 *
 * You may not apply legal terms or technological measures that legally restrict others
 * from doing anything the license permits.
 *
 * You may contact me, atom0s, at atom0s@live.com for more information or if you are seeking commercial use.
 *
 * No warranties are given.
 */

"use strict";

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