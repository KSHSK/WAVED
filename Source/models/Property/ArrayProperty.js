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

        //type

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

        if(!defined(opts.getOptionText)) {
            this.getOptionText = function(value){
                return value;
            };
        } else {
            this.getOptionText = opts.getOptionText;
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
                if (this.isValidValue(value)) {
                    this.error = false;
                    this.message = '';
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
        state.options = [];
        var options = this.options;
        for (var i = 0; i < options.length; i++) {
            if (typeof options[i] === 'object' && typeof options[i].getState === 'function') {
                state.options.push(options[i].getState());
            } else {
                state.options.push(options[i]);
            }
        }

        return state;
    };

    ArrayProperty.prototype.setState = function(state) {
        Property.prototype.setState.call(this, state);
        this._options = [];
        var options = defaultValue(state.options, []);
        var replaceWithObject = false;
        for (var i = 0; i < options.length; i++) {
            var value = options[i];
            if (defined(value.type)) {
                var O = window.wavedTypes[value.type];
                if (defined(O)) {
                    replaceWithObject = true;
                    value = new O(value);
                }
            }
            this._options.push(value);
        }

        // Need to call this after this._options is set, so the isValidValue function works.
        Property.prototype.setState.call(this, state);

        if (replaceWithObject) {
            for (var j = 0; j < this._options.length; j++) {
                if (defined(this._value) && this._options[j].name === this._value.name) {
                    this._value = this._options[j];
                }
            }
        }

        this._displayValue = this._value;
    };

    return ArrayProperty;
});