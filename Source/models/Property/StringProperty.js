define([
        './Property',
        'util/defined',
        'util/defaultValue',
        'models/Constants/PropertyTemplateName',
        'knockout'
    ],function(
        Property,
        defined,
        defaultValue,
        PropertyTemplateName,
        ko
    ){
    'use strict';

    var StringProperty = function(options) {
        options = defined(options) ? options : {};
        Property.call(this, options);
        var textArea = defaultValue(options.textArea, false);
        if (textArea) {
            this._templateName = PropertyTemplateName.LONG_STRING;
            this._displayTemplateName = PropertyTemplateName.LONG_STRING_DISPLAY;
        } else {
            this._templateName = PropertyTemplateName.STRING;
            this._displayTemplateName = PropertyTemplateName.STRING_DISPLAY;
        }

        this.setState(options);

        ko.track(this);
    };

    StringProperty.prototype = Object.create(Property.prototype);

    StringProperty.prototype.reset = function() {
        // Update values.
        this._originalValue = '';
        this._value = '';
        this._displayValue = '';

        // Force the view to update.
        ko.getObservable(this, '_originalValue').valueHasMutated();
        ko.getObservable(this, '_value').valueHasMutated();
        ko.getObservable(this, '_displayValue').valueHasMutated();

        // Update error.
        this.message = '';
        this.error = !this.isValidValue(this._value);
    };

    Object.defineProperties(StringProperty.prototype, {
        originalValue: {
            get: function() {
                return this._originalValue;
            },
            set: function(value) {
                if (typeof value === 'string' && this.isValidValue(value)) {
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
                if (typeof value === 'string' && this.isValidValue(value)) {
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
                if (typeof value === 'string' && this.isValidDisplayValue(value)) {
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

    return StringProperty;
});