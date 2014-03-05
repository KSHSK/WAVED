/*global define*/
define(function() {
    'use strict';

    /**
     * Returns query parameters in the form {key1: [value1, value2], key2: [value1]}.
     * Use $.param(getQueryParams(), true) to get the query back.
     */
    var getQueryParams = function() {
        var qs = window.location.search.substring(1);
        var options = {};
        var params = qs.split('&');
        for (var i in params) {
            var param = params[i];
            var keyValuePair = param.split('=');
            if (keyValuePair.length > 1) {
                var key = keyValuePair[0];
                var value = decodeURIComponent(keyValuePair[1].replace(/\+/g, ' '));

                if (typeof options[key] === 'undefined') {
                    options[key] = [];
                }

                options[key].push(value);
            }
        }
        return options;
    };

    return getQueryParams;
});