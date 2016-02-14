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
 * Navigation Service
 *
 * Exposes functions related to navigation menu handling.
 *
 * @param {object} arcanus                          The arcanus application instance.
 */
module.exports = function NavigationServiceModule(arcanus) {
    /**
     * The internal list of raw menus managed by the navigation service.
     *
     * @private
     * @type {object}
     */
    var __rawMenus = {};

    /**
     * The internal list of raw menu creation options.
     *
     * @private
     * @type {object}
     */
    var __menuOptions = {};

    /**
     * The internal list of compiled menus managed by the navigation service.
     *
     * @private
     * @type {object}
     */
    var __compiledMenus = {};

    /**
     * Implements the navigation service.
     *
     * @constructor
     */
    function NavigationService() {
        // Initialize the base service class..
        arcanus.BaseService.call(this);
    }

    // Inherit from the base service class (required!)..
    NavigationService.prototype = Object.create(arcanus.BaseService.prototype);
    NavigationService.constructor = arcanus.BaseService;

    /**
     * Returns the alias of the current service. (Must be overridden!)
     *
     * @returns {string}                            The alias of the current service.
     */
    NavigationService.prototype.getAlias = function () {
        return 'navigationservice';
    };

    /**
     * Initializes the current service. (Must be overridden!)
     *
     * @param {function} done                       The callback to invoke when finished.
     */
    NavigationService.prototype.Initialize = function (done) {
        done(null, true);
    };

    /** **/
    /** **/
    /** **/

    /**
     * Obtains a list of alias' used within the given menu.
     *
     * @private
     * @static
     * @param {object} menu                         The menu object to obtain the alias' from.
     * @param {object} list                         The object to obtain the alias' within.
     */
    function menuGetAliasList(menu, list) {
        if (menu instanceof Array) {
            menu.forEach(function (m) {
                menuGetAliasList(m, list);
            });
        } else {
            list.push(menu.alias);
            if (menu.children) {
                menu.children.forEach(function (m) {
                    menuGetAliasList(m, list);
                });
            }
        }
    }

    /**
     * Determines if the given menu contains the alias.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to check for the alias within.
     * @param {string} alias                        The alias to check for.
     * @returns {boolean}                           True if found, false otherwise.
     */
    function menuHasAlias(menu, alias) {
        // Obtain the list of alias' from the menu..
        var list = [];
        menuGetAliasList(menu, list);

        // Check if the list contains the alias..
        return list.indexOf(alias) !== -1;
    }

    /**
     * Obtains a menu item by its alias.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to obtain the item from.
     * @param {string} alias                        The alias of the item to obtain.
     * @returns {object}                            The menu item if found, null otherwise.
     */
    function menuGetItem(menu, alias) {
        var result = null;
        var x = 0;

        if (menu instanceof Array) {
            for (x = 0; x < menu.length; x++) {
                if (result = menuGetItem(menu[x], alias))
                    return result;
            }
            return null;
        } else {
            if (menu.alias === alias)
                return menu;

            if (menu.children) {
                for (x = 0; x < menu.children.length; x++) {
                    if (result = menuGetItem(menu.children[x], alias))
                        return result;
                }
            }

            return null;
        }
    }

    /**
     * Obtains a menu items parent by its alias.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to obtain the items parent from.
     * @param {string} alias                        The alias of the item to obtain the parent of.
     * @param {object=} parent                      The item parent used during recursion.
     * @returns {object}                            The parent of the child if found, null otherwise.
     */
    function menuGetItemParent(menu, alias, parent) {
        var result = null;
        var x = 0;

        if (menu instanceof Array) {
            for (x = 0; x < menu.length; x++) {
                if (result = menuGetItemParent(menu[x], alias, menu))
                    return result;
            }
            return null;
        } else {
            if (menu.alias === alias)
                return parent;

            if (menu.children) {
                for (x = 0; x < menu.children.length; x++) {
                    if (result = menuGetItemParent(menu.children[x], alias, menu))
                        return result;
                }
            }

            return null;
        }
    }

    /**
     * Determines if the given menu is valid.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to validate.
     * @returns {boolean}                           True if valid, false otherwise.
     */
    function menuIsValid(menu) {
        // Validate root menu items..
        if (menu instanceof Array) {
            return menu.every(function (m) {
                return menuIsValid(m);
            });
        } else {
            // Require the menu has an alias..
            if (!arcanus.utils.isNonEmptyString(menu.alias))
                return false;

            // Require the menu has a title (unless its a separator)..
            if (!arcanus.utils.isNonEmptyString(menu.title)) {
                if (!menu.separator)
                    return false;
            }

            // Require the menu has a href (unless its a separator, or has children)..
            if (!arcanus.utils.isNonEmptyString(menu.href)) {
                if (!menu.separator) {
                    if (!menu.children || !arcanus.utils.isArray(menu.children) || menu.children.length == 0)
                        return false;
                }
            } else {
                // Separators should not have links..
                if (menu.separator)
                    return false;
            }

            // Validate the menu children..
            if (menu.children) {
                // Require that separators do not have children..
                if (menu.separator)
                    return false;

                // Require children to be an array..
                if (!arcanus.utils.isArray(menu.children))
                    return false;

                // Validate each child..
                return menu.children.every(function (m) {
                    return menuIsValid(m);
                });
            }

            return true;
        }
    }

    /**
     * Determines if two menus intersect each other.
     *
     * @private
     * @static
     * @param {object} menu1                        The first menu to check.
     * @param {object} menu2                        The second menu to check.
     * @returns {boolean}                           True if the menus intersect, false otherwise.
     */
    function menuIntersects(menu1, menu2) {
        var list1 = [];
        var list2 = [];

        menuGetAliasList(menu1, list1);
        menuGetAliasList(menu2, list2);

        return list1.filter(function (n) {
                return list2.indexOf(n) !== -1
            }).length > 0;
    }

    /**
     * Compiles a menu base link.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to be compiled.
     * @returns {string}                            The formatted link.
     */
    function compileLink(menu) {
        var menuC = menu.class || null;
        var menuD = menu.directives || null;
        var menuS = menu.style || null;

        var m = arcanus.utils.format(`<li%s%s%s><a href="${menu.href}">`,
            (menuC === null) ? '' : ` class="${menuC}"`,
            (menuS === null) ? '' : ` style="${menuS}"`,
            (menuD === null) ? '' : ` ${menuD}`);

        if (arcanus.utils.isNonEmptyString(menu.icon)) {
            m += `<i class="fa ${menu.icon}" style="width: 24px; text-align: center;"></i> `;
        }

        m += `${menu.title}</a></li>`;

        return m;
    }

    /**
     * Compiles a menu separator.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to be compiled.
     * @returns {string}                            The formatted separator.
     */
    function compileSeparator(menu) {
        var menuC = menu.class || null;
        var menuD = menu.directives || null;
        var menuS = menu.style || null;

        return arcanus.utils.format('<li class="%s" role="separator"%s%s></li>',
            (menuC === null) ? 'divider' : menuC,
            (menuS === null) ? '' : ` style="${menuS}"`,
            (menuD === null) ? '' : ` ${menuD}`);
    }

    /**
     * Compiles a dropdown menu.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to be compiled.
     * @param {number} depth                        The current depth being processed.
     * @param {object} compiled                     The output to hold the compiled menu data.
     */
    function compileDropdownMenu(menu, depth, compiled) {
        var menuC = menu.class || null;
        var menuD = menu.directives || null;
        var menuS = menu.style || null;

        var m = arcanus.utils.format(`<li%s%s%s><a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">`,
            (menuC === null) ? ' class="dropdown"' : ` class="${menuC}"`,
            (menuS === null) ? '' : ` style="${menuS}"`,
            (menuD === null) ? '' : ` ${menuD}`);

        if (arcanus.utils.isNonEmptyString(menu.icon)) {
            m += `<i class="fa ${menu.icon}" style="width: 24px; text-align: center;"></i> `;
        }

        m += `${menu.title} <span class="caret"></span></a><ul class="dropdown-menu">`;

        compiled.push(m);
        compileMenu(menu.children, depth + 1, compiled);
        compiled.push('</ul></li>');
    }

    /**
     * Compiles a dropdown sub-menu.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to be compiled.
     * @param {number} depth                        The current depth being processed.
     * @param {object} compiled                     The output to hold the compiled menu data.
     */
    function compileDropdownSubMenu(menu, depth, compiled) {
        var menuC = menu.class || null;
        var menuD = menu.directives || null;
        var menuS = menu.style || null;

        var m = arcanus.utils.format(`<li%s%s%s><a href="#">`,
            (menuC === null) ? ' class="dropdown-submenu"' : ` class="${menuC}"`,
            (menuS === null) ? '' : ` style="${menuS}"`,
            (menuD === null) ? '' : ` ${menuD}`);

        if (arcanus.utils.isNonEmptyString(menu.icon)) {
            m += `<i class="fa ${menu.icon}" style="width: 24px; text-align: center;"></i> `;
        }

        m += `${menu.title}</a><ul class="dropdown-menu">`;

        compiled.push(m);
        compileMenu(menu.children, depth + 1, compiled);
        compiled.push('</ul></li>');
    }

    /**
     * Compiles a menu into html.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to be compiled.
     * @param {number} depth                        The current depth being processed.
     * @param {object} compiled                     The output to hold the compiled menu data.
     */
    function compileMenu(menu, depth, compiled) {
        // If the current object is an array, compile each item..
        if (menu instanceof Array) {
            for (var x = 0; x < menu.length; x++) {
                compileMenu(menu[x], depth, compiled);
            }
        } else {
            if (!menu.children || menu.children.length === 0) {
                if (menu.separator && menu.separator === true) {
                    compiled.push(compileSeparator(menu));
                } else {
                    compiled.push(compileLink(menu));
                }
            } else if (menu.children && menu.children.length > 0) {
                if (depth === 0) {
                    compileDropdownMenu(menu, depth, compiled);
                } else {
                    compileDropdownSubMenu(menu, depth, compiled);
                }
            } else {
                throw new Error('Invalid menu being process.');
            }
        }
    }

    /**
     * Compiles a simple menu rather then a bootstrap navigation based menu.
     *
     * @private
     * @static
     * @param {object} menu                         The menu to be compiled.
     * @param {number} depth                        The current depth being processed.
     * @param {object} compiled                     The output to hold the compiled menu data.
     */
    function compileSimpleMenu(menu, depth, compiled) {
        if (menu instanceof Array) {
            for (var x = 0; x < menu.length; x++) {
                compileSimpleMenu(menu[x], depth, compiled);
            }
        } else {
            if (!menu.children || menu.children.length === 0) {
                if (menu.separator && menu.separator === true) {
                    compiled.push(compileSeparator(menu));
                } else {
                    compiled.push(compileLink(menu));
                }
            } else if (menu.children && menu.children.length > 0) {
                var menuC = menu.class || null;
                var menuD = menu.directives || null;
                var menuS = menu.style || null;

                var m = arcanus.utils.format(`<li%s%s%s>${menu.title}<ul>`,
                    (menuC === null) ? '' : ` class="${menuC}"`,
                    (menuS === null) ? '' : ` style="${menuS}"`,
                    (menuD === null) ? '' : ` ${menuD}`);

                compiled.push(m);
                compileSimpleMenu(menu.children, depth + 1, compiled);
                compiled.push('</ul></li>');
            }
        }
    }

    /**
     * Invalidates a compiled menu by its name. If no name is given, invalidates all compiled menus.
     *
     * @param {string=} name                        The menu to invalidate.
     */
    NavigationService.prototype.Invalidate = function (name) {
        if (arcanus.utils.isNonEmptyString(name)) {
            delete __compiledMenus[name];
        } else {
            __compiledMenus = {};
        }
    };

    /**
     * Determines if the given menu is valid.
     *
     * @param {object} menu                         The menu to validate.
     * @returns {boolean}                           True if valid, false otherwise.
     */
    NavigationService.prototype.isMenuValid = function (menu) {
        return menuIsValid(menu);
    };

    /**
     * Creates a new menu.
     *
     * @param {string} name                         The name of the menu to create.
     * @param {object} menu                         The menu to create.
     * @param {object=} options                     The creation options for the menu.
     * @returns {boolean}                           True on success, false otherwise.
     */
    NavigationService.prototype.createMenu = function (name, menu, options) {
        // Prevent creating menus with the same name..
        if (this.getMenuRaw(name))
            return false;

        // Ensure the incoming menu is valid..
        if (!menuIsValid(menu))
            return false;

        if (!options)
            options = {};

        // Store the new raw menu..
        __rawMenus[name.toLowerCase()] = menu;
        __menuOptions[name.toLowerCase()] = options;

        // Cleanup any possible stale compiled menu..
        delete __compiledMenus[name.toLowerCase()];
        return true;
    };

    /**
     * Deletes a menu.
     *
     * @param {string} name                         The name of the menu to delete.
     */
    NavigationService.prototype.deleteMenu = function (name) {
        var menuRaw = __rawMenus[name.toLowerCase()];
        var menuOpt = __menuOptions[name.toLowerCase()];
        var menuCmp = __compiledMenus[name.toLowerCase()];

        // Invalid call if no menu exists / existed..
        if (!menuRaw && !menuOpt && !menuCmp)
            return false;

        delete __rawMenus[name.toLowerCase()];
        delete __menuOptions[name.toLowerCase()];
        delete __compiledMenus[name.toLowerCase()];
        return true;
    };

    /**
     * Obtains a compiled menu by its name.
     *
     * @param {string} name                         The name of the menu to obtain.
     * @returns {string}                            The compiled menu string.
     */
    NavigationService.prototype.getMenu = function (name) {
        // Return the already compiled menu if it exists..
        var menu = __compiledMenus[name.toLowerCase()];
        if (menu)
            return menu;

        // If no raw menu exists, return an empty string..
        var rawMenu = __rawMenus[name.toLowerCase()];
        if (!rawMenu)
            return '';

        var menuC = __menuOptions[name.toLowerCase()].class || null;
        var menuD = __menuOptions[name.toLowerCase()].directives || null;
        var menuS = __menuOptions[name.toLowerCase()].style || null;

        var m = arcanus.utils.format(`<ul%s%s%s>${menu.title}<ul>`,
            (menuC === null) ? '' : ` class="${menuC}"`,
            (menuS === null) ? '' : ` style="${menuS}"`,
            (menuD === null) ? '' : ` ${menuD}`);

        var compiled = ['<ul>'];

        // Compile the raw menu..
        if (rawMenu[0].simple && rawMenu[0].simple === true) {
            compileSimpleMenu(rawMenu, 0, compiled);
        } else {
            compileMenu(rawMenu, 0, compiled);
        }

        compiled.push('</ul>');

        // Store the new compiled menu..
        __compiledMenus[name.toLowerCase()] = compiled.join('');
        return compiled.join('');
    };

    /**
     * Obtains a raw menu by its name.
     *
     * @param {string} name                         The name of the menu to obtain.
     * @returns {object}                            The raw menu.
     */
    NavigationService.prototype.getMenuRaw = function (name) {
        var rawMenu = __rawMenus[name.toLowerCase()];
        return !rawMenu ? null : rawMenu;
    };

    /**
     * Appends an item to the given menu. If an alias is present, the item will be appended
     * to that menu items children.
     *
     * @param {string} name                         The menu to append the item to.
     * @param {object} item                         The item to append.
     * @param {string=} alias                       The alias of the menu item to append to.
     * @returns {boolean}                           True on success, false otherwise.
     */
    NavigationService.prototype.appendMenuItem = function (name, item, alias) {
        // Was this called by accident with an array..
        if (item instanceof Array) {
            return this.appendMenuItems(name, item, alias);
        }

        var menu = __rawMenus[name.toLowerCase()];
        if (!menu)
            return false;

        // Validate the incoming menu item..
        if (!menuIsValid(item) || menuHasAlias(menu, item.alias) || menuIntersects(menu, item))
            return false;

        // If no alias is given, append to the menu itself..
        if (!arcanus.utils.isNonEmptyString(alias)) {
            menu.push(item);
        } else {
            // Alias given, append to the item by its alias..
            var menuItem = menuGetItem(menu, alias);
            if (!menuItem)
                return false;

            // Ensure the menu items children is an array..
            if (!menuItem.children || !arcanus.utils.isArray(menuItem.children))
                menuItem.children = [];

            // Append the item..
            menuItem.children.push(item);
        }

        // Invalidate this menu..
        this.Invalidate(name);
        return true;
    };

    /**
     * Appends an array of items to the given menu. If an alias is present, the items will be
     * appended to that menu items childen.
     *
     * @param {string} name                         The menu to append the items to.
     * @param {object} items                        The items to append.
     * @param {string=} alias                       The alias of the menu item to append to.
     * @returns {boolean}                           True on success, false otherwise.
     */
    NavigationService.prototype.appendMenuItems = function (name, items, alias) {
        var self = this;

        if (!(items instanceof Array))
            return false;

        var menu = __rawMenus[name.toLowerCase()];
        if (!menu)
            return false;

        // Validate the incoming menu items..
        if (!menuIsValid(items) || menuIntersects(menu, items))
            return false;

        // If no alias is given, append to the menu itself..
        if (!arcanus.utils.isNonEmptyString(alias)) {
            items.forEach(function (i) {
                menu.push(i);
            });
        } else {
            // Alias given, append to the item by its alias..
            items.forEach(function (i) {
                self.appendMenuItem(name, i, alias);
            });
        }

        // Invalidate this menu..
        this.Invalidate(name);
        return true;
    };

    /**
     * Deletes a menu item by its alias.
     *
     * @param {string} name                         The menu to delete the item from.
     * @param {string} alias                        The alias of the item to delete.
     * @returns {boolean}                           True on success, false otherwise.
     */
    NavigationService.prototype.deleteMenuItem = function (name, alias) {
        // Obtain the menu to delete from..
        var menu = __rawMenus[name.toLowerCase()];
        if (!menu)
            return false;

        // Obtain the menu item to delete..
        var menuItem = menuGetItem(menu, alias);
        if (!menuItem)
            return false;

        // Obtain the menu items parent..
        var parent = menuGetItemParent(menu, menuItem.alias);
        if (!parent)
            return false;

        // Obtain the index of the child..
        var index = -1;
        if (parent.children) {
            index = parent.children.indexOf(menuItem);
            if (index === -1)
                return false;
            if (parent.children.splice(index, 1).length === 0)
                return false;
        } else {
            index = parent.indexOf(menuItem);
            if (index === -1)
                return false;
            if (parent.splice(index, 1).length === 0)
                return false;
        }

        // Invalidate this menu..
        this.Invalidate(name);
        return true;
    };

    /**
     * Obtains a menu item by its alias.
     *
     * @param {string} name                         The menu to obtain the item from.
     * @param {string} alias                        The alias of the item to obtain.
     * @returns {object}                            The menu item if successful, null otherwise.
     */
    NavigationService.prototype.getMenuItem = function (name, alias) {
        var menu = __rawMenus[name.toLowerCase()];
        if (!menu)
            return false;

        return menuGetItem(menu, alias);
    };

    // Return the navigation service..
    return NavigationService;
};