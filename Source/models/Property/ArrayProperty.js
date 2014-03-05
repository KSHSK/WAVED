/*global define*/
define([
        './Property',
        'util/defined',
        'util/defaultValue',
        'models/Constants/PropertyTemplateName',
        'knockout'
    ],function(
        Property,
        defined,
        defaultValue,
        PropertyTemplateName,
        ko
    ){
    'use strict';


    var ArrayProperty = function(state) {
        Property.call(this, state);

        state = defined(state) ? state : {};

        this._value = state.value;
        this._options = defaultValue(state.options, []);
        if (defined(state.validValue)) {
            this.isValidValue = state.validValue;
        }
        else {
            this.isValidValue = function(value) {
                if (defined(this._options) && this._options.length > 0) {
                    return (this._options.indexOf(value) !== -1);
                }
                return true;
            };
        }

        this._templateName = PropertyTemplateName.ARRAY;

        ko.track(this);

        this.error = !this.isValidValue(this._value);
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

    ArrayProperty.prototype.getState = function() {
        return {
            'value': this.value,
            'options': this.options
        };
    };

    ArrayProperty.prototype.setState = function() {
        // TODO: Implement Me
    };

    return ArrayProperty;
});