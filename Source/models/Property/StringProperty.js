/*global define*/
define([
        './Property',
        'util/defined',
        '../PropertyTemplateName',
        'knockout'
    ],function(
        Property,
        defined,
        PropertyTemplateName,
        ko
    ){
    'use strict';
    var StringProperty = function(state) {
        Property.call(this, state);

        state = defined(state) ? state : {};

        this._value = state.value;
        if (defined(state.validValue)) {
            this.isValidValue = state.validValue;
        } else {
            this.isValidValue = function(value) {
                return true;
            };
        }

        this._templateName = PropertyTemplateName.STRING;

        ko.track(this);
    };

    StringProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(StringProperty.prototype, {
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                if (typeof value === 'string' && this.isValidValue(value)) {
                    this._value = value;
                }
            }
        }
    });

    return StringProperty;
});