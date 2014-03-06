/*global define*/
define(['./getQueryParams', 'jquery'], function(getQueryParams, $) {
    'use strict';

    /**
     * Replaces the URL query string after adding/changing one of the values.
     */
    var updateQueryByName = function(key, value) {
        var params = getQueryParams();
        params[key] = value;
        var newQuery = '?' + $.param(params, true);
        history.replaceState({}, '', newQuery);
    };

    return updateQueryByName;
});