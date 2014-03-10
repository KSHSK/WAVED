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

        this._actionValue = this._value;

        this._templateName = PropertyTemplateName.BOOLEAN;
        this._actionTemplateName = PropertyTemplateName.BOOLEAN_ACTION;

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
                    this._actionValue = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        },
        actionValue: {
            get: function() {
                return this._actionValue;
            },
            set: function(value) {
                this._actionValue = value;
            }
        }
    });

    return BooleanProperty;
});