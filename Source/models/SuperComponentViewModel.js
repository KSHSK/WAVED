/*global define*/
define([
        'models/Property/StringProperty',
        'jquery',
        'util/defined',
        'util/createValidator',
        'knockout'
    ], function(
        StringProperty,
        $,
        defined,
        createValidator,
        ko) {
    'use strict';

    var SuperComponentViewModel = function(state) {
        ko.track(this);
    };

    Object.defineProperties(SuperComponentViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name];
            }
        },
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                this._name = value; // TODO: Validation
            }
        }
    });

    SuperComponentViewModel.prototype.getState = function() {
        return {
            'name': this.name.getState()
        };
    };

    SuperComponentViewModel.prototype.setState = function(state) {
        // Set name
        var nameValue = '';
        if (defined(state.name)) {
            nameValue = state.name.value;
        }

        this._name = new StringProperty({
            displayName: 'Name',
            value: nameValue,
            validValue: createValidator({
                regex: new RegExp('^[a-zA-Z0-9_\\- ]+$'),
                minLength: 1,
                maxLength: 50
            }),
            errorMessage: 'May only contain alphanumerics, hypens (-), underscores(_) and spaces.'
        });
    };

    return SuperComponentViewModel;
});