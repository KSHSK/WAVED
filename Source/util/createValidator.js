/*global define*/
define(['./defined'],function(defined) {
    'use strict';

    var createValidator = function(options) {
        var regex = options.regex;
        var minLength = options.minLength;
        var maxLength = options.maxLength;

        // define a function to do validation
        return function (newValue) {
            var hasError = false;
            if (defined(minLength)) {
                hasError = hasError || newValue.length < minLength;
            }
            if (defined(maxLength)) {
                hasError = hasError || newValue.length > maxLength;
            }
            if (defined(regex)) {
                hasError = hasError || !(regex.test(newValue));
            }
            return !hasError;
        };
    };

    return createValidator;
});