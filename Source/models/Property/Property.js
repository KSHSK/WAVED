define(['knockout',
        'util/defined',
        'util/defaultValue',
        'util/subscribeObservable'
    ],function(
        ko,
        defined,
        defaultValue,
        subscribeObservable){
    'use strict';

    var Property = function(options) {
        options = defined(options) ? options : {};

        // TODO: Validation, etc
        this._templateName = undefined; // PropertyTemplateName, defined by subclasses.
        this._originalValue = undefined;
        this._value = undefined; // Type determined by subclasses.
        this._displayValue = undefined;

        this.visible = defaultValue(options.visible, true);
        this.onchange = options.onchange;
        this.ondisplaychange = options.ondisplaychange;

        this.message = '';
        this.dialogErrorMessage = '';
        this._error = false;
        this._displayError = false;

        this._displayName = options.displayName;
        this.errorMessage = defined(options.errorMessage) ? options.errorMessage : 'Invalid value';

        if (defined(options.validValue)) {
            this.isValidValue = options.validValue;
        }
        else {
            this.isValidValue = function(value) {
                return true;
            };
        }

        // For custom validation in the action editor
        if(defined(options.validDisplayValue)) {
            this.isValidDisplayValue = options.validDisplayValue;
        }
        else {
            this.isValidDisplayValue = this.isValidValue;
        }

        this.setState(options);

        ko.track(this);

        var self = this;
        subscribeObservable(this, '_originalValue', function() {
            self.value = self.originalValue;
            self.displayValue = self.originalValue;
        });

        // When this._value changes, call onchange.
        subscribeObservable(this, '_value', function(newValue) {
            if (defined(self.onchange)) {
                self.onchange(newValue);
            }
            self.displayValue = self.value;
        });

        subscribeObservable(this, '_displayValue', function(newValue) {
            if (defined(self.ondisplaychange)) {
                self.ondisplaychange(newValue);
            }
        });

        this.updateUI = function() {
            //abstract
        };
    };

    Object.defineProperties(Property.prototype, {
        displayName: {
            get: function() {
                return this._displayName;
            }
        },
        templateName: {
            get: function() {
                return this._templateName;
            },
            set: function(templateName) {
                this._templateName = templateName;
            }
        },
        displayTemplateName: {
            get: function() {
                return this._displayTemplateName;
            }
        },
        originalValue: {
            get: function() {
                return this._originalValue;
            }
        },
        error: {
            get: function() {
                return this._error;
            },
            set: function(value) {
                this._error = value;
            }
        },
        displayError: {
            get: function() {
                return this._displayError;
            },
            set: function(value) {
                this._displayError = value;
            }
        }
    });

    Property.prototype.getDisplayState = function() {
        if (typeof this._displayValue === 'object' && typeof this._displayValue.getDisplayState === 'function') {
            return {
                'value': this._displayValue.getDisplayState()
            };
        }
        return {
            'value': this._displayValue
        };
    };

    Property.prototype.setDisplayState = function(state) {
        if(defined(state.value) && state.value !== this.originalValue) {
            this.displayValue = state.value;
        }
    };

    Property.prototype.getState = function() {
        if (typeof this._originalValue === 'object' && typeof this._originalValue.getState === 'function') {
            return {
                'value': this._originalValue.getState()
            };
        }
        return {
            'value': this._originalValue
        };
    };

    Property.prototype.setState = function(state) {
        var value = state.value;
        if (defined(state.value) && defined(state.value.type)) {
            var O = window.wavedTypes[state.value.type];
            if (defined(O)) {
                value = new O(state.value);
            }
        }

        this._value = value; //setState called before subscription is added
        this._originalValue = value;
        this._displayValue = value;
        this._error = !this.isValidValue(this._value);
        this._displayError = !this.isValidDisplayValue(this._displayValue);
    };

    /**
     * @param valueType 'originalValue' or 'value' or 'displayValue'
     */
    Property.prototype.displayErrorMessage = function(valueType) {

        if(valueType === 'displayValue') {
            this.dialogErrorMessage = this.errorMessage;
        }
        else {
            this.message = this.errorMessage;
        }
    };

    Property.prototype.isValidValue = function() {
        // TODO: Abstract method
    };

    Property.prototype.getValue = function() {
        // TODO: Abstract method
    };

    Property.prototype.setValue = function(value) {
        // TODO: Abstract method
    };

    /**
     * Return any objects in a Property that are Properties or may contain Properties
     */
    Property.prototype.getSubscribableNestedProperties = function(){
        // Abstract
    };

    return Property;
});