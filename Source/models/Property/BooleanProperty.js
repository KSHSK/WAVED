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
    var BooleanProperty = function(state) {
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

        this._templateName = PropertyTemplateName.BOOLEAN;
        this._displayName = state.displayName;

        ko.track(this);
    };

//    BooleanProperty.prototype = new Property();
//    BooleanProperty.prototype.constructor = BooleanProperty;

    Object.defineProperties(BooleanProperty.prototype, {
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                if (typeof value === 'boolean' && this.isValidValue(value)) {
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

    return BooleanProperty;
});