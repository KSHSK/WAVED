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

    var BooleanProperty = function(state) {
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

        this._displayValue = this._value;

        this._templateName = PropertyTemplateName.BOOLEAN;
        this._displayTemplateName = PropertyTemplateName.BOOLEAN_DISPLAY;

        ko.track(this);

        this.error = !this.isValidValue(this._value);
    };

    BooleanProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(BooleanProperty.prototype, {
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                if (typeof value === 'boolean' && this.isValidValue(value)) {
                    this.error = false;
                    this.message = '';
                    this._value = value;
                    this._displayValue = value;
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
                this._displayValue = value;
            }
        }
    });

    return BooleanProperty;
});