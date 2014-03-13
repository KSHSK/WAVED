define(function() {
    'use strict';

    var defaultValue = function(value, def) {
        if (typeof value !== 'undefined') {
            return value;
        }
        return def;
    };

    return defaultValue;
});