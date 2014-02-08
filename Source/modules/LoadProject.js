/*global define*/
/**
 * A module for loading an existing project.
 */
define(['jquery'], function($) {
    'use strict';
    var LoadProjectModule = {
        tryToLoadExistingProject: function() {
            // TODO Implement me.

            var deferred = $.Deferred();

            // Remove this reject when implementing.
            deferred.reject();

            return deferred.promise();
        }
    };

    return LoadProjectModule;
});