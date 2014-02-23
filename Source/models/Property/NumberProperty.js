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
    var NumberProperty = function(state) {
        state = defined(state) ? state : {};
//        Property.call(this, state);
        this._value = state.value;
        if (defined(state.validValue)) {
            this.isValidValue = state.validValue;
        } else {
            this.isValidValue = function(value) {
                return true;
            };
        }
        this._displayName = state.displayName;
        this._templateName = PropertyTemplateName.NUMBER;

        ko.track(this);
    };

//    NumberProperty.prototype = new Property({displayName: ''});
//    NumberProperty.prototype.constructor = NumberProperty;

    Object.defineProperties(NumberProperty.prototype, {
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                if (!isNaN(Number(value)) && this.isValidValue(value)) {
                    this._value = Number(value);
                }
            }
        },
        displayName: {
            get: function() {
                return this._displayName;
            }
        },
        templateName : {
            get: function() {
                return this._templateName;
            }
        }
    });

    return NumberProperty;
});