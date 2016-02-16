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

var utils = require('../include/utils');

/**
 * Implements a set of utility functions useful for menus.
 *
 * @constructor
 */
function MenuUtils() { }

/**
 * Determines if the given menu item is valid.
 *
 * @static
 * @param {object} menu                             The menu item to validate.
 * @returns {boolean}                               True if valid, false otherwise.
 */
MenuUtils.isValidMenuItem = function (menu) {
    // Array of tests that a menu has to pass to be considered valid..
    var tests = [
        // Require the menu has a valid alias..
        function (m) {
            return utils.isNonEmptyString(m.alias);
        },

        // Require properties to be strings if present..
        function (m) {
            if (Object(m).hasOwnProperty('title') && !utils.isString(m.title))
                return false;
            if (Object(m).hasOwnProperty('class') && !utils.isString(m.class))
                return false;
            if (Object(m).hasOwnProperty('directives') && !utils.isString(m.directives))
                return false;
            if (Object(m).hasOwnProperty('style') && !utils.isString(m.style))
                return false;

            return true;
        },

        // Determine the type of menu item and run specific validations for it..
        function (m) {
            // Ensure children is an array if it exists..
            if (Object(m).hasOwnProperty('children') && !(m.children instanceof Array))
                return false;

            // Is this a separator..
            if (m.separator) {
                console.log(`Menu Validator - Separator - ${m.alias}`);
                return MenuUtils.isValidMenuSeparator(m);
            }

            // Is this a parent..
            if (!m.href) {
                console.log(`Menu Validator - Parent    - ${m.alias}`);
                return MenuUtils.isValidMenuParent(m);
            }

            // Assume it is a menu item link..
            console.log(`Menu Validator - Link      - ${m.alias}`);
            return MenuUtils.isValidMenuLink(m);
        }
    ];

    // Run each test to validate the menu item..
    var failed = false;
    tests.forEach(function (test) {
        if (!test(menu))
            failed = true;
    });

    return failed === false;
};

/**
 * Determines if the given menu item (separator) is valid.
 *
 * @static
 * @param {object} menu                             The menu item to validate.
 * @returns {boolean}                               True if valid, false otherwise.
 */
MenuUtils.isValidMenuSeparator = function (menu) {
    var tests = [
        // Ensure the separator value is valid..
        function (m) {
            return m.separator && m.separator === false
                ? false
                : m.separator === true;
        },

        // Separators should not have a link..
        function (m) {
            return !m.href;
        },

        // Separators should not have children..
        function (m) {
            return !m.children;
        }
    ];

    // Run each test to validate the menu item..
    var failed = false;
    tests.forEach(function (test) {
        if (!test(menu))
            failed = true;
    });

    return failed === false;
};

/**
 * Determines if the given menu item (parent) is valid.
 *
 * @static
 * @param {object} menu                             The menu item to validate.
 * @returns {boolean}                               True if valid, false otherwise.
 */
MenuUtils.isValidMenuParent = function (menu) {
    var tests = [
        // Parents should not have a link..
        function (m) {
            return !m.href;
        },

        // Parents should have children..
        function (m) {
            return m.children && m.children instanceof Array && m.children.length > 0;
        }
    ];

    // Run each test to validate the menu item..
    var failed = false;
    tests.forEach(function (test) {
        if (!test(menu))
            failed = true;
    });

    return failed === false;
};

/**
 * Determines if the given menu item (parent) is valid.
 *
 * @static
 * @param {object} menu                             The menu item to validate.
 * @returns {boolean}                               True if valid, false otherwise.
 */
MenuUtils.isValidMenuLink = function (menu) {
    var tests = [
        // Links must have a href..
        function (m) {
            return !!m.href;
        },

        // Links must not have children..
        function (m) {
            return !m.children ? true : m.children.length === 0;
        }
    ];

    // Run each test to validate the menu item..
    var failed = false;
    tests.forEach(function (test) {
        if (!test(menu))
            failed = true;
    });

    return failed === false;
};

// Export this module..
module.exports = MenuUtils;