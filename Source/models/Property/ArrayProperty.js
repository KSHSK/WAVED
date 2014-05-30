define([
        './Property',
        'util/defined',
        'util/defaultValue',
        'util/subscribeObservable',
        'models/Constants/PropertyTemplateName',
        'knockout'
    ],function(
        Property,
        defined,
        defaultValue,
        subscribeObservable,
        PropertyTemplateName,
        ko
    ){
    'use strict';

    var ArrayProperty = function(opts) {
        opts = defined(opts) ? opts : {};
        Property.call(this, opts);

        //TODO: Add type property to track the object type of the options in the array.
        // (Which is probably needed for a cleaner setState solution)

        this._templateName = PropertyTemplateName.ARRAY;
        this._displayTemplateName = PropertyTemplateName.ARRAY_DISPLAY;

        this._options = defaultValue(opts.options, []);
        this._displayOptions = defaultValue(opts.options, []);

        // Set a default isValidValue function if necessary.
        if (!defined(opts.validValue)) {
            this.isValidValue = function(value) {
                if (defined(this._options) && this._options.length > 0) {
                    return (this._options.indexOf(value) !== -1);
                }
                return false;
            };
        }

        if(!defined(opts.validDisplayValue)) {
            this.isValidDisplayValue = function(value) {
                if (defined(this._displayOptions) && this._displayOptions.length > 0) {
                    return (this._displayOptions.indexOf(value) !== -1);
                }
                return false;
            };
        }

        if(!defined(opts.getOptionText)) {
            this.getOptionText = function(value){
                return value;
            };
        }
        else {
            this.getOptionText = opts.getOptionText;
        }

        if(!defined(opts.optionsCaption)) {
            this.optionsCaption = 'Choose an option...';
        }
        else {
            this.optionsCaption = opts.optionsCaption;
        }

        this.setState(opts);

        ko.track(this);

        // When the options change, make sure to change the displayOptions as well
        var self = this;
        subscribeObservable(this, '_options', function(){
            self._displayOptions = self._options;
        });
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
                        this._value = '';
                        this._displayValue = '';
                        this.error = true;
                    }
                }
            }
        },
        displayOptions: {
            get: function() {
                return this._displayOptions;
            },
            set: function(displayOptions) {
                if (Array.isArray(displayOptions)) {
                    this._displayOptions = displayOptions;
                    if (displayOptions.indexOf(this._displayValue) === -1) {
                        this._displayValue = '';
                        this.error = true;
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
                if (this.isValidDisplayValue(value)) {
                    this.displayError = false;
                    this.dialogErrorMessage = '';
                    this._displayValue = value;
                }
                else {
                    this.displayError = true;
                    this.dialogErrorMessage = this.errorMessage;
                }
            }
        }
    });

    ArrayProperty.prototype.getDisplayState = function() {
        var displayState = Property.prototype.getDisplayState.call(this);
        displayState.options = this.options;
        return displayState;
    };

    ArrayProperty.prototype.getState = function() {
        var state = Property.prototype.getState.call(this);
        state.options = this.options;
        return state;
    };

    ArrayProperty.prototype.setState = function(state) {
        if (defined(state.options)) {
            this.options = state.options;
        }

        Property.prototype.setState.call(this, state);
    };

    return ArrayProperty;
});