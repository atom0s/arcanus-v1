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

var mysql = require('mysql');

module.exports = function (arcanus) {

    function Plugin() { }

    /**
     * Initializes the MySQL database connection.
     *
     * @param {function} done                       The callback to invoke when finished.
     */
    Plugin.Initialize = function (done) {
        // Obtain the database configuration block from the root config..
        var dbconn = arcanus.config.database || null;
        if (!dbconn) {
            return done(null, false);
        }

        // Create the connection..
        arcanus.db = mysql.createConnection(dbconn);

        /**
         * Ensures that the sql client will reconnect on errors.
         */
        function keepSqlAlive() {
            arcanus.db.on('error', function (err) {
                // Log the error..
                arcanus.log.error(err);

                // Ignore non-fatal errors (these do not kill the connection)..
                if (!err.fatal)
                    return;

                // Recreate the connection..
                arcanus.db = mysql.createConnection(dbconn);
                keepSqlAlive();

                // Reconnect to the database..
                arcanus.db.connect(function (err) {
                    if (err) {
                        arcanus.log.error(err);
                        process.exit(1);
                    }
                });
            });
        }

        // Activate the connection..
        keepSqlAlive();

        // Return successful..
        done(null, true);
    };

    // Return the plugin instance..
    return Plugin;
};