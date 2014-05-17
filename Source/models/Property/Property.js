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
        this._error = false;

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

        this.setState(options);

        ko.track(this);

        var self = this;
        subscribeObservable(this, '_originalValue', function() {
            self._value = self._originalValue;
        });

        // When this._value changes, call onchange.
        subscribeObservable(this, '_value', function(newValue) {
            if (defined(self.onchange)) {
                self.onchange(newValue);
            }
            self._displayValue = self._value;
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
        error : {
            get : function() {
                return this._error;
            },
            set : function(value) {
                this._error = value;
            }
        }
    });

    Property.prototype.getState = function() {
        if (typeof this._value === 'object' && typeof this._value.getState === 'function') {
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
    };

    /**
     * @param valueType 'originalValue' or 'value' or 'displayValue'
     */
    Property.prototype.displayErrorMessage = function(valueType) {
        this.message = this.errorMessage;
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