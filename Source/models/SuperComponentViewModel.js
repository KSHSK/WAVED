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
        nameOptions.validValue =  createValidator({
            regex: new RegExp('^[a-zA-Z0-9_\\- ]+$'),
            minLength: 1,
            maxLength: 50
        });
        nameOptions.errorMessage = 'May only contain alphanumerics, hypens (-), underscores(_) and spaces.';
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