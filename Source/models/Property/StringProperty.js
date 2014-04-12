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
        this.originalValue = '';
        this.message = '';
        this.error = !this.isValidValue(this._value);

        // Force the view to update.
        ko.getObservable(this, '_value').valueHasMutated();
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
                if (typeof value === 'string' && this.isValidValue(value)) {
                    this.error = false;
                    this.message = '';
                    this._displayValue = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        }
    });

    return StringProperty;
});