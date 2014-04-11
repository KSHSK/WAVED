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
                if (!isNaN(Number(value)) && this.isValidValue(value)) {
                    this.error = false;
                    this.message = '';
                    this._originalValue = Number(value);
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
                if (!isNaN(Number(value)) && this.isValidValue(value)) {
                    this.error = false;
                    this.message = '';
                    this._value = Number(value);
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
                if (!isNaN(Number(value)) && this.isValidValue(value)) {
                    this.error = false;
                    this.message = '';
                    this._displayValue = Number(value);
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        }
    });

    return NumberProperty;
});