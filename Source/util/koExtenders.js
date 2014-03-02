/*global define*/
define(['knockout','util/defined'],function(ko, defined){
    'use strict';

    ko.extenders.validate = function(target, options) {
        var regex = options.regex;
        var message = options.messageText;
        var minLength = options.minLength;
        var maxLength = options.maxLength;

        // define a function to do validation
        function validate(newValue) {
            newValue = defined(newValue) ? newValue : '';
            var hasError = false;
            var errorMessage = '';
            var thisError;
            if (defined(minLength)) {
                thisError = newValue.length < minLength;
                hasError = hasError || thisError;
                if (thisError) {
                    errorMessage += '<br>Must be at least ' + minLength + ' character(s)';
                }
            }
            if (defined(maxLength)) {
                thisError = newValue.length > maxLength;
                hasError = hasError || thisError;
                if (thisError) {
                    errorMessage += '<br>Must be at least ' + maxLength + ' characters';
                }
            }
            if (defined(regex)) {
                thisError = !(regex.test(newValue));
                hasError = hasError || thisError;
                if (defined(message) && thisError) {
                    errorMessage += '<br>' + message;
                }
            }
            errorMessage = errorMessage.substring(4);

            options.error(hasError);
            options.message(errorMessage);
        }

        // validate whenever the value changes
        target.subscribe(validate);

        // return the original observable
        return target;
    };

});