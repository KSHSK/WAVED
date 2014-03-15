define(['./getQueryParams', 'jquery'], function(getQueryParams, $) {
    'use strict';

    /**
     * Replaces the URL query string after adding/changing one of the values.
     */
    var updateQueryByName = function(key, value) {
        var params = getQueryParams();

        if (value) {
            params[key] = value;
        }
        else {
            delete params[key];
        }

        var newQuery = '?' + $.param(params, true);
        history.replaceState({}, '', newQuery);
    };

    return updateQueryByName;
});