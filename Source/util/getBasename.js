define(function() {
    'use strict';

    var getBasename = function(value) {
        return value.split(new RegExp('(\\\\|/)')).pop();
    };
    return getBasename;
});