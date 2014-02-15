/*global define*/
define(['knockout','util/defined'],function(ko, defined){
    'use strict';

    ko.extenders.validate = function(target, options) {
        var regex = options.regex;
        var message = options.message;
        var minLength = options.minLength;
        var maxLength = options.maxLength;

        //add some sub-observables to our observable
        target.hasError = ko.observable();
        target.message = ko.observable();

        //define a function to do validation
        function validate(newValue) {
            var hasError = false;
            var errorMessage = '';
            if (defined(minLength)) {
                hasError = hasError || (newValue.length < minLength);
                errorMessage += '\nMust be at least ' + minLength + ' characters';
            }
            if (defined(maxLength)) {
                hasError = hasError || (newValue.length > maxLength);
                errorMessage += '\nMust be at least ' + minLength + ' characters';
            }
            if (defined(regex)) {
                hasError = hasError || !(regex.test(newValue));
                if (defined(message)){
                    errorMessage += '\n' + message;
                }
            }
            errorMessage = errorMessage.trim();

            target.hasError(hasError);
            target.message(errorMessage);
        }

        //initial validation
        validate(target());

        //validate whenever the value changes
        target.subscribe(validate);

        //return the original observable
        return target;
    };

});