define(['jquery'], function($) {

    /* ### Private WAVED Variables ### */
    
    // True if changes have been made since the last save; otherwise false.
    var _dirty = false;
    
    // Has the application been started yet.
    var _started = false;
    
    var GoogleAnalyticsModule = {
        unboundDisplay: $('#google-analytics-unbound'),
        boundDisplay: $('#google-analytics-bound'),
        uaPreview: $('#google-analytics-ua-preview'),
        categoryPreview: $('#google-analytics-category-preview'),
        uaInputField: $('#google-analytics-ua'),
        categoryInputField: $('#google-analytics-category'),
        uaError: $('#google-analytics-ua-error'),
        categoryError: $('#google-analytics-category-error'),
        ua: '',
        category: '',
        
        isGoogleAnalyticsValid: function() {
            var isValid = true;
            
            // Regex for matching Google Analytics codes (case-insensitive)
            // Code match pattern UA-XXXXXXX-YY where X and Y are integers with arbitrary length 
            var uaRegex = new RegExp('((UA)(-)(\\d+)(-)(\\d+))', 'i');
            var categoryRegex = new RegExp('[a-zA-Z0-9_\\- ]+');
            
            if(!$(this.uaInputField).val().match(uaRegex)){
                displayText(this.uaError, "UA code is not in the correct format.");
                isValid = false;
            }
            
            if(!$(this.categoryInputField).val().match(categoryRegex)){
                displayText(this.categoryError, "May only contain alphanumerics, hypens (-), underscores(_) and spaces.");
                isValid = false;
            }
            
            return isValid;
        },
        
        addGoogleAnalytics: function() {
            if(this.isGoogleAnalyticsValid()){
                this.ua = $(this.uaInputField).val();
                this.category = $(this.categoryInputField).val();
                
                // Clear error
                clearText(this.uaError);
                clearText(this.categoryError);
                
                // Swap the visibility of the divs
                this.unboundDisplay.hide();
                this.boundDisplay.show();
                
                // Update the previews
                $(this.uaPreview).html(this.ua);
                $(this.categoryPreview).html(this.category);
            }
        },
        
        removeGoogleAnalytics: function() {
            this.unboundDisplay.show();
            this.boundDisplay.hide();
            
            $(this.uaPreview).html('');
            $(this.categoryPreview).html('');
            
            this.ua = '';
            this.category = '';
            
            $(this.uaInputField).val('');
            $(this.categoryInputField).val('');
        },
        
        resetInputFields: function() {
            $(this.uaInputField).val('');
            $(this.categoryInputField).val('');
            clearText(this.uaError);
            clearText(this.categoryError);
        }
    };

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
        
		var charText;
		var message;
        if (typeof minLength === 'number') {
            if (value.length < minLength) {
                charText = "character" + (minLength === 1 ? "" : "s");
                message = "Must be at least " + minLength + " " + charText + ".";
                error.text(message);
                disableButton(submitButton);
                return;
            }
        }
        
        if (typeof maxLength === 'number') {
            if (value.length > maxLength) {
                charText = "character" + (minLength === 1 ? "" : "s");
                message = "Cannot be more than " + maxLength + " " + charText + ".";
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