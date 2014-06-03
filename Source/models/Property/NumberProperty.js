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

                // If the user deletes the value, it still converts it to 0, which is odd behavior from a UX perspective
                if(value === '') {
                    this.error = true;
                    this.message = this.errorMessage;
                    return;
                }

                if (!isNaN(Number(value)) && this.isValidValue(value)) {
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

                // If the user deletes the value, it still converts it to 0, which is odd behavior from a UX perspective
                if(value === '') {
                    this.error = true;
                    this.message = this.errorMessage;
                    return;
                }

                if (!isNaN(Number(value)) && this.isValidValue(value)) {
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

                // If the user deletes the value, it still converts it to 0, which is odd behavior from a UX perspective
                if(value === '') {
                    this.displayError = true;
                    this.dialogErrorMessage = this.errorMessage;
                    return;
                }

                if (!isNaN(Number(value)) && this.isValidDisplayValue(value)) {
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