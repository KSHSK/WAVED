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
        var mainSection = $('#mainSection');
        
        // Input validation
        $(document).on('keyup', 'input.validate', function(event) {
            validateInput($(event.currentTarget));
        });
    }
    
    function validateInput(element) {
        var value = element.val().trim();
        
        var error = element.next('div.error');
        
        // TODO: This will only be correct for dialogs.
        //       Update this for non-dialogs when possible.
        var submitButton = element.parents('.ui-dialog').find('.submit-button');
        
        var minLength = element.data("min-length");
        var maxLength = element.data("max-length");
        var regex = element.attr("data-match");
        var regexDescription = element.attr("data-match-desc");
        
        if (typeof minLength === 'number') {
            if (value.length < minLength) {
                var charText = "character" + (minLength === 1 ? "" : "s");
                var message = "Must be at least " + minLength + " " + charText + ".";
                error.text(message);
                disableButton(submitButton);
                return;
            }
        }
        
        if (typeof maxLength === 'number') {
            if (value.length > maxLength) {
                var charText = "character" + (minLength === 1 ? "" : "s");
                var message = "Cannot be more than " + maxLength + " " + charText + ".";
                error.text(message);
                disableButton(submitButton);
                return;
            }
        }
        
        if (typeof regex !== 'undefined' && typeof regexDescription !== 'undefined') {
            if (!value.match(RegExp(regex))) {
                error.text(regexDescription);
                disableButton(submitButton);
                return;
            }
        }
        
        // Clear error.
        error.text("");
        enableButton(submitButton);
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