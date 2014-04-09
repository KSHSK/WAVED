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
        this._value = undefined; // Type determined by subclasses.
        this._displayValue = undefined;
        this.onchange = options.onchange;
        this.ondisplaychange = options.ondisplaychange;

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

        // When this._value changes, call onchange.
        var self = this;
        subscribeObservable(this, '_value', function(newValue) {
            if (defined(self.onchange)) {
                self.onchange(newValue);
            }
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
        }
    });

    Property.prototype.getState = function() {
        if (typeof this._value === 'object' && typeof this._value.getState === 'function') {
            return {
                'value': this._value.getState()
            };
        }
        return {
            'value': this._value
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

        this._value = value;
        this._displayValue = value;
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