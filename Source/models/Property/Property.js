define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var Property = function(options) {
        options = defined(options) ? options : {};

        // TODO: Validation, etc
        this._templateName = undefined; // PropertyTemplateName, defined by subclasses.
        this._originalValue = undefined;
        this._value = undefined; // Type determined by subclasses.
        this._displayValue = undefined;

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