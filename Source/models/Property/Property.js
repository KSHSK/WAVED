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
        this.errorMessage = defined(state.errorMessage) ? state.errorMessage : 'invalid valid';
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
            }
        }
    });

    Property.prototype.isValidValue = function() {
        // TODO: Abstract method
    };

    Property.prototype.getValue = function () {
        // TODO: Abstract method
    };

    Property.prototype.setValue = function(value) {
        // TODO: Abstract method
    };

    return Property;
});