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

var assert = require('assert');
var Arcanus = require('../arcanus');

describe('NavigationService', function () {
    /**
     * Example menu to be used in tests.
     *
     * @type {Array}
     */
    var exampleMenu = [
        {
            alias: 'account',
            href: '',
            icon: 'fa-gear',
            title: 'Account',
            children: [
                {
                    alias: 'profile',
                    href: '/account/profile',
                    icon: 'fa-user',
                    title: 'Profile',
                    children: []
                },
                {
                    alias: 'account-sep1',
                    separator: true
                },
                {
                    alias: 'changepassword',
                    href: '/account/changepassword',
                    icon: 'fa-key',
                    title: 'Change Password',
                    children: []
                },
                {
                    alias: 'changeemail',
                    href: '/account/changeemail',
                    icon: 'fa-envelope-o',
                    title: 'Change Email',
                    children: []
                }
            ]
        },
        {
            alias: 'logout',
            href: '/account/logout',
            icon: 'fa-sign-out',
            title: 'logout',
            children: []
        }
    ];

    /**
     * Called before all tests to prepare the test environment.
     *
     * @param {function} done                       Callback function to invoke when completed.
     */
    before(function (done) {
        var config = require('../include/config.js').load();
        this.arcanus = new Arcanus(config);
        this.nav = this.arcanus.get().services.get('navigationservice');
        done();
    });

    /**                     **/
    /** Validation Tests    **/
    /**                     **/

    it('Should validate a menu.', function (done) {
        assert.ok(this.nav.isMenuValid(exampleMenu), 'Failed to validate menu.');
        done();
    });

    it('Should validate a menu item. (menu item)', function (done) {
        var menu = {
            alias: 'test',
            href: 'http://www.google.com/',
            icon: 'fa-user',
            title: 'Test',
            children: []
        };

        assert.ok(this.nav.isMenuValid(menu), 'Failed to validate menu.');
        done();
    });

    it('Should validate a menu item. (separator)', function (done) {
        var menu = [
            {
                alias: 'test',
                separator: true
            }
        ];

        assert.ok(this.nav.isMenuValid(menu), 'Failed to validate menu.');
        done();
    });

    it('Should fail to validate an invalid menu item. (menu item)', function (done) {
        var menu = [
            {
                alias: '',
                href: 'http://www.google.com',
                icon: 'fa-users',
                title: 'Test',
                children: []
            }
        ];

        assert(this.nav.isMenuValid(menu) == false);
        done();
    });

    it('Should fail to validate an invalid menu item. (menu item)', function (done) {
        var menu = [
            {
                alias: 'test',
                href: '',
                icon: 'fa-users',
                title: '',
                children: []
            }
        ];

        assert(this.nav.isMenuValid(menu) == false);
        done();
    });

    it('Should fail to validate a menu item. (separator)', function (done) {
        var menu = [
            {
                alias: 'test',
                separator: true,
                href: 'http://www.google.com/'
            }
        ];

        assert(this.nav.isMenuValid(menu) == false);
        done();
    });

    it('Should fail to validate a menu item. (separator)', function (done) {
        var menu = [
            {
                alias: 'test',
                separator: true,
                children: []
            }
        ];

        assert(this.nav.isMenuValid(menu) == false);
        done();
    });

    /**                     **/
    /** Creation Tests      **/
    /**                     **/

    it('Should fail create a menu.', function (done) {
        var menu = [
            {
                alias: '',
                href: 'http://www.google.com/',
                icon: 'fa-user',
                title: 'Test',
                children: []
            }
        ];

        assert(this.nav.createMenu('test', menu) == false);
        done();
    });

    it('Should fail to obtain a menu.', function (done) {
        assert(this.nav.getMenu('test') === '');
        done();
    });

    it('Should create a menu.', function (done) {
        assert(this.nav.createMenu('test', exampleMenu) == true);
        done();
    });

    it('Should obtain a menu.', function (done) {
        assert(this.nav.getMenu('test').length > 0);
        done();
    });

    /**                     **/
    /** Deletion Tests      **/
    /**                     **/

    it('Should delete a created menu.', function (done) {
        assert(this.nav.deleteMenu('test') == true);
        done();
    });

    it('Should fail to delete menu.', function (done) {
        assert(this.nav.deleteMenu('test') == false);
        done();
    });

    /**                     **/
    /** Get Menu Tests      **/
    /**                     **/

    it('Should create a menu.', function (done) {
        assert(this.nav.createMenu('test', exampleMenu) == true);
        done();
    });

    it('Should get a menu.', function (done) {
        assert(this.nav.getMenu('test').length > 0);
        done();
    });

    it('Should fail to get a menu.', function (done) {
        assert(this.nav.getMenu('test2') === '');
        done();
    });

    it('Should get a menu item.', function (done) {
        assert(this.nav.getMenuItem('test', 'profile') !== null);
        done();
    });

    it('Should fail to get a menu item.', function (done) {
        assert(this.nav.getMenuItem('test', 'profile2') == null);
        done();
    });

    /**                     **/
    /** Menu Item Tests     **/
    /**                     **/

    it('Should append a menu item. (object)', function (done) {
        var item = {
            alias: 'test',
            href: 'http://www.google.com/',
            icon: 'fa-users',
            title: 'Test',
            children: []
        };

        assert(this.nav.appendMenuItem('test', item) === true);
        done();
    });

    it('Should append a menu item. (array)', function (done) {
        var item = [
            {
                alias: 'test2',
                href: 'http://www.google.com/',
                icon: 'fa-users',
                title: 'Test',
                children: []
            }
        ];

        assert(this.nav.appendMenuItem('test', item) === true);
        done();
    });

    it('Should fail to append a menu item. (already exists)', function (done) {
        var item = [
            {
                alias: 'test',
                href: 'http://www.google.com/',
                icon: 'fa-users',
                title: 'Test',
                children: []
            }
        ];

        assert(this.nav.appendMenuItem('test', item) === false);
        done();
    });

    it('Should append menu items. (array)', function (done) {
        var item = [
            {
                alias: 'test3',
                href: 'http://www.google.com/',
                icon: 'fa-users',
                title: 'Test',
                children: []
            },
            {
                alias: 'test4',
                href: 'http://www.google.com/',
                icon: 'fa-users',
                title: 'Test',
                children: []
            }
        ];

        assert(this.nav.appendMenuItems('test', item) === true);
        done();
    });

    it('Should fail to append menu items. (object instead of array)', function (done) {
        var item = {
            alias: 'test5',
            href: 'http://www.google.com/',
            icon: 'fa-users',
            title: 'Test',
            children: []
        };

        assert(this.nav.appendMenuItems('test', item) === false);
        done();
    });

    it('Should delete a menu item.', function (done) {
        var oldLength = this.nav.getMenuRaw('test').length;
        assert(this.nav.deleteMenuItem('test', 'test') === true);
        assert(this.nav.getMenuRaw('test').length === oldLength - 1);
        done();
    });

    it('Should fail to delete a menu item.', function (done) {
        assert(this.nav.deleteMenuItem('test', 'test') === false);
        done();
    });

    /** **/
    /** **/
    /** **/

    it('Should create an extended menu.', function (done) {
        var menu = [
            {
                alias: 'test',
                href: 'http://www.google.com/',
                icon: 'fa-user',
                title: 'Test',
                style: 'border: 1px solid #000; color: red;',
                simple: true,
                children: [
                    {
                        alias: 'test2',
                        href: 'http://www.google.com/',
                        icon: 'fa-user',
                        title: 'Test 2',
                        children: [
                            {
                                alias: 'test10',
                                href: 'http://www.google.com',
                                icon: 'fa-user',
                                title: 'Test 10'
                            },
                            {
                                alias: 'test11',
                                href: 'http://www.google.com',
                                icon: 'fa-user',
                                title: 'Test 11'
                            },
                            {
                                alias: 'test12',
                                href: 'http://www.google.com',
                                icon: 'fa-user',
                                title: 'Test 12'
                            }
                        ]
                    },
                    {
                        alias: 'test3',
                        separator: true,
                        class: 'menu-child menu-test3',
                        style: 'border: 1px solid #000; color: red;',
                        directives: 'ng-cloak'
                    },
                    {
                        alias: 'test4',
                        href: 'http://www.google.com/',
                        icon: 'fa-user',
                        title: 'Test 4',
                        children: []
                    },
                    {
                        alias: 'test5',
                        separator: true
                    },
                    {
                        alias: 'test6',
                        href: 'http://www.google.com/',
                        icon: 'fa-user',
                        title: 'Test 6',
                        children: []
                    },
                    {
                        alias: 'test7',
                        href: 'http://www.google.com/',
                        icon: 'fa-user',
                        title: 'Test 7',
                        children: []
                    },
                    {
                        alias: 'test8',
                        href: 'http://www.google.com/',
                        icon: 'fa-user',
                        title: 'Test 8',
                        children: []
                    }
                ]
            },
            {
                alias: 'derp',
                href: 'http://atom0s.com/',
                icon: '',
                title: 'Derp',
                children: []
            },
            {
                alias: 'derp2',
                href: 'http://atom0s.com/',
                icon: 'fa-users',
                title: 'Derp 2',
                children: []
            },
            {
                alias: 'derp3',
                href: 'http://atom0s.com/',
                icon: '',
                title: 'Derp 3',
                children: []
            }
        ];

        assert(this.nav.createMenu('extended', menu) === true);
        done();
    });
});