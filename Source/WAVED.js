define(['jquery'], function($) {

    /* ### Private WAVED Variables ### */
    
    // True if changes have been made since the last save; otherwise false.
    var _dirty = false;
    
    // Has the application been started yet.
    var _started = false;

    /* ### General use functions ### */
    
    function disableButton(button) {
        button.attr('disabled', 'disabled').addClass('ui-state-disabled');
    }
    
    function enableButton(button) {
        button.removeAttr('disabled', 'disabled').removeClass('ui-state-disabled');
    }
    
    /**
     * Adds all event listeners for the application.
     */
    function registerEventHandlers() {
        
        // Input validation (keyup for keypresses, input for right-click pasting)
        $(document).on('keyup input', 'input.validate', function(event) {
            validateInput($(event.currentTarget));
        });
    }
    
    function validateInput(element) {
        var value = element.val().trim();
        
        var error = element.next('div.error');
        
        // Prevents messing with other submit-buttons on the page (as long as body is the only common ancestor)
        // TODO: Fix: Still messes with any parent elements with submit-buttons
        var submitButton = element.parentsUntil('body').find('.submit-button');
        
        var minLength = element.data("min-length");
        var maxLength = element.data("max-length");
        var regex = element.attr("data-match");
        var regexDescription = element.attr("data-match-desc");
        var regexModifier = element.attr("data-match-modifier");
        
		var charText;
		var message;
        if (typeof minLength === 'number') {
            if (value.length < minLength) {
                charText = "character" + (minLength === 1 ? "" : "s");
                message = "Must be at least " + minLength + " " + charText + ".";
                error.text(message);
                disableButton(submitButton);
                return false;
            }
        }
        
        if (typeof maxLength === 'number') {
            if (value.length > maxLength) {
                charText = "character" + (minLength === 1 ? "" : "s");
                message = "Cannot be more than " + maxLength + " " + charText + ".";
                error.text(message);
                disableButton(submitButton);
                return false;
            }
        }
        
        if (typeof regex !== 'undefined' && typeof regexDescription !== 'undefined') {
            if (!value.match(RegExp(regex, regexModifier))) {
                error.text(regexDescription);
                disableButton(submitButton);
                return false;
            }
        }
        
        // Clear error.
        error.text("");
        enableButton(submitButton);
        return true;
    }
    
    /* ### WAVED Definition ### */
    var WAVED = {
        start: function() {
            // Can only be called once.
            if (_started === false) {
                _started = true;
                
                // TODO: We can get rid of this when we update validation to use AngularJS
                registerEventHandlers();
            }
        },

        validateInputField: function(element) {
            return validateInput(element);
        },
        
        isDirty: function() {
            return _dirty;
        },

        setDirty: function() {
            _dirty = true;
        },
        
        setClean: function() {
            _dirty = false;
        }
    };

    return WAVED;
});