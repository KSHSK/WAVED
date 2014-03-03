/*global define*/
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

    var NumberProperty = function(state) {
        Property.call(this, state);

        state = defined(state) ? state : {};

        this._value = state.value;
        if (defined(state.validValue)) {
            this.isValidValue = state.validValue;
        }
        else {
            this.isValidValue = function(value) {
                return true;
            };
        }
        this._templateName = PropertyTemplateName.NUMBER;

        ko.track(this);

        this.error = !this.isValidValue(this._value);
    };

    NumberProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(NumberProperty.prototype, {
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
        }
    });

    return NumberProperty;
});