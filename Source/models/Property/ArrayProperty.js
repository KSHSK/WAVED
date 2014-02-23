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
    var ArrayProperty = function(state) {
        Property.call(this, state);

        state = defined(state) ? state : {};

        this._value = state.value;
        this._options = state.options;
        if (defined(state.validValue)) {
            this.isValidValue = state.validValue;
        } else {
            this.isValidValue = function(value) {
                if (defined(this._options)) {
                    return (this._options.indexOf(value) !== -1);
                }
                return false;
            };
        }

        this._templateName = PropertyTemplateName.ARRAY;

        ko.track(this);
    };

    ArrayProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(ArrayProperty.prototype, {
        options: {
            get: function() {
                return this._options;
            },
            set: function(options) {
                if (Array.isArray(options)) {
                    this._options = options;
                    if (options.indexOf(this._value) === -1) {
                        this._value = undefined;
                    }
                }
            }
        },
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                if (this.isValidValue(value)) {
                    this._value = value;
                }
            }
        }
    });

    return ArrayProperty;
});