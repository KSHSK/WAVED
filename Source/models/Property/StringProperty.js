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

        this._templateName = PropertyTemplateName.STRING;
        this._displayName = state.displayName;

        ko.track(this);
    };

//    StringProperty.prototype = new Property();
//    StringProperty.prototype.constructor = StringProperty;

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

    return StringProperty;
});