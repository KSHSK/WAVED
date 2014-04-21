define(['knockout',
        'util/defined',
        'util/subscribeObservable'
    ],function(
        ko,
        defined,
        subscribeObservable){
    'use strict';

    var Property = function(options) {
        options = defined(options) ? options : {};

        // TODO: Validation, etc
        this._templateName = undefined; // PropertyTemplateName, defined by subclasses.
        this._originalValue = undefined;
        this._value = undefined; // Type determined by subclasses.
        this._displayValue = undefined;
        this.onchange = options.onchange;

        this.message = '';
        this.error = false;

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
            self._displayValue = self._originalValue;
        });

        subscribeObservable(this, '_value', function() {
            self._displayValue = self._value;
        });

        // When this._value changes, call onchange.
        subscribeObservable(this, '_value', function() {
            if (defined(self.onchange)) {
                self.onchange();
            }
        });
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
        }
    });

    Property.prototype.getState = function() {
        return {
            'value': this._originalValue
        };
    };

    Property.prototype.setState = function(state) {
        this._originalValue = state.value;
        this._value = state.value;
        this._displayValue = state.value;
        this.error = !this.isValidValue(this._value);
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