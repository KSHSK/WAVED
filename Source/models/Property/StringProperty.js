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

    var StringProperty = function(options) {
        options = defined(options) ? options : {};
        Property.call(this, options);

        this._templateName = PropertyTemplateName.STRING;

        this.setState(options);

        ko.track(this);
    };

    StringProperty.prototype = Object.create(Property.prototype);

    StringProperty.prototype.reset = function() {
        // Set non-empty first in case the value was already empty. Otherwise, knockout won't update the display.
        this._value = ' ';
        this._value = '';

        this.message = '';

        this.error = false;
    };

    Object.defineProperties(StringProperty.prototype, {
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
        }
    });

    return StringProperty;
});