/*global define*/
define([
        'models/Property/StringProperty',
        'jquery',
        'util/defined',
        'knockout'
    ], function(
        StringProperty,
        $,
        defined,
        ko) {
    'use strict';

    var SuperComponentViewModel = function(state) {
        var nameOptions;
        if (defined(state.name)) {
            nameOptions = {
                displayName: state.name.displayName,
                value: state.name.value
            };
        }
        else {
            nameOptions = {
                displayName: 'Name',
                value: ''
            };
        }
        nameOptions.isValidValue = function(value) {
            return value.match(new RegExp('^[a-zA-Z0-9_\\- ]+$')) && value.length > 0 && value.length < 51;
        };
        this._name = new StringProperty(nameOptions);

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
        // TODO
    };

    SuperComponentViewModel.prototype.setState = function(state) {
        // TODO
    };

    return SuperComponentViewModel;
});