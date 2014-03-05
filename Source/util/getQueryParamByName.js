/*global define*/
define(['./getQueryParams'], function(getQueryParams) {
    'use strict';

    /**
     * Returns a single query parameter with the given name as the key. If that key has more that one value, the first
     * value is returned.
     */
    var getQueryParamByName = function(name) {
        var params = getQueryParams();
        var values = params[name];
        if (typeof values === 'undefined') {
            return "";
        }

        return values[0];
    };

    return getQueryParamByName;
});