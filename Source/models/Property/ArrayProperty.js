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


    var ArrayProperty = function(opts) {
        opts = defined(opts) ? opts : {};
        Property.call(this, opts);

        this._templateName = PropertyTemplateName.ARRAY;
        this._displayTemplateName = PropertyTemplateName.ARRAY_DISPLAY;

        this._options = [];

        // Set a default isValidValue function if necessary.
        if (!defined(opts.validValue)) {
            this.isValidValue = function(value) {
                if (defined(this._options) && this._options.length > 0) {
                    return (this._options.indexOf(value) !== -1);
                }
                return true;
            };
        }

        this.setState(opts);

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
        originalValue: {
            get: function() {
                return this._originalValue;
            },
            set: function(value) {
                if (this.isValidValue(value)) {
                    this.error = false;
                    this.message = '';
                    this._originalValue = value;
                    this._value = value;
                    this._displayValue = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
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
                    this._displayValue = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        }
    });

    ArrayProperty.prototype.getState = function() {
        var state = Property.prototype.getState.call(this);
        state._options = this.options;

        return state;
    };

    ArrayProperty.prototype.setState = function(state) {
        this._options = defaultValue(state.options, []);

        // Need to call this after this._options is set, so the isValidValue function works.
        Property.prototype.setState.call(this, state);
    };

    return ArrayProperty;
});