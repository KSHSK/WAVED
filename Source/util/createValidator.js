define([
        './defined',
        'modules/UniqueTracker'
    ],
    function(
        defined,
        UniqueTracker) {
    'use strict';

    //TODO: Make a validator class?
    var createValidator = function(options) {
        var regex = options.regex;
        var minLength = options.minLength;
        var maxLength = options.maxLength;
        var min = options.min;
        var max = options.max;
        var unique = options.unique;

        // define a function to do validation
        return function(newValue) {
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
            if (defined(min)) {
                hasError = hasError || min > newValue;
            }
            if (defined(max)) {
                hasError = hasError || max < newValue;
            }
            if (defined(unique) && defined(unique.namespace) && defined(unique.item)) {
                hasError = hasError || !UniqueTracker.addValueIfUnique(unique.namespace, newValue, unique.item);
            }
            return !hasError;
        };
    };

    return createValidator;
});