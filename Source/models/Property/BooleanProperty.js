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

    var BooleanProperty = function(options) {
        options = defined(options) ? options : {};
        Property.call(this, options);

        this._templateName = PropertyTemplateName.BOOLEAN;
        this._displayTemplateName = PropertyTemplateName.BOOLEAN_DISPLAY;

        this.setState(options);

        ko.track(this);
    };

    BooleanProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(BooleanProperty.prototype, {
        originalValue: {
            get: function() {
                return this._originalValue;
            },
            set: function(value) {
                if (typeof value === 'boolean' && this.isValidValue(value)) {
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
                if (typeof value === 'boolean' && this.isValidValue(value)) {
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
                if (typeof value === 'boolean' && this.isValidDisplayValue(value)) {
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

    return BooleanProperty;
});