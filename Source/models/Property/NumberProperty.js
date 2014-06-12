define([
        './Property',
        'util/defined',
        'models/Constants/PropertyTemplateName',
        'knockout'
    ],function(
        Property,
        defined,
        PropertyTemplateName,
        ko
    ){
    'use strict';

    var NumberProperty = function(options) {
        options = defined(options) ? options : {};
        Property.call(this, options);

        this._templateName = PropertyTemplateName.NUMBER;
        this._displayTemplateName = PropertyTemplateName.NUMBER_DISPLAY;

        this.setState(options);

        ko.track(this);
    };

    NumberProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(NumberProperty.prototype, {
        originalValue: {
            get: function() {
                return this._originalValue;
            },
            set: function(value) {
                var templateRegex = /{{[\w]+}}/g;
                /*
                 * Both Number() and parseFloat() are needed due to deal with quirks in each
                 * 1. Number() accepts whitespace as valid and treats it as 0 while parseFloat() doesn't
                 * 2. parseFloat() accepts strings concatenated with numbers (like '10px') while Number() doesn't
                 */
                if (!isNaN(Number(value)) && this.isValidValue(value) && !isNaN(parseFloat(value))) {
                    this.error = false;
                    this.message = '';
                    this._originalValue = Number(value);
                }
                else if (templateRegex.test(value)) {
                    this.error = false;
                    this.message = '';
                    this._originalValue = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        },
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                var templateRegex = /{{[\w]+}}/g;
                if (!isNaN(Number(value)) && this.isValidValue(value) && !isNaN(parseFloat(value))) {
                    this.error = false;
                    this.message = '';
                    this._value = Number(value);
                }
                else if (templateRegex.test(value)) {
                    this.error = false;
                    this.message = '';
                    this._value = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        },
        displayValue: {
            get: function() {
                return this._displayValue;
            },
            set: function(value) {
                var templateRegex = /{{[\w]+}}/g;
                if (!isNaN(Number(value)) && this.isValidDisplayValue(value) && !isNaN(parseFloat(value))) {
                    this.displayError = false;
                    this.message = '';
                    this._displayValue = Number(value);
                }
                else if (templateRegex.test(value)) {
                    this.displayError = false;
                    this.dialogErrorMessage = '';
                    this._displayValue = value;
                }
                else {
                    this.displayError = true;
                    this.dialogErrorMessage = this.errorMessage;
                }
            }
        }
    });

    return NumberProperty;
});