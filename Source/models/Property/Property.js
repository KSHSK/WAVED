/*global define*/
define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var Property = function(state) {
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        this._displayName = state.displayName;
        this._templateName = undefined; // PropertyTemplateName
        this._actionTemplateName = undefined; // PropertyTemplateName
        this._value = undefined; // Type determined by subclasses.

        this.errorMessage = defined(state.errorMessage) ? state.errorMessage : 'Invalid value';
        this.message = '';
        this.error = false;

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
        actionTemplateName: {
            get: function() {
                return this._actionTemplateName;
            }
        }
    });

    Property.prototype.getState = function() {
        return {
            'value': this._value
        };
    };

    Property.prototype.setState = function() {
        // TODO: Is this abstract or should it be implemented?
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

    return Property;
});