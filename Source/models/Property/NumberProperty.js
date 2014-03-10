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
        state = defined(state) ? state : {};
        Property.call(this, state);
        this.setState(state);

        this._templateName = PropertyTemplateName.NUMBER;

        ko.track(this);
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