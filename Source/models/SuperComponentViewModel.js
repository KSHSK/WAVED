/*global define*/
define([
        'models/Property/StringProperty',
        'jquery',
        'knockout'
    ], function(
        StringProperty,
        $,
        ko) {
    'use strict';

    var SuperComponentViewModel = function(state) {
        if (typeof state.name === 'undefined') {
            throw new Error('SuperComponentViewModel name is required');
        }

        this._name = state.name; // StringProperty

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
        //TODO
    };

    SuperComponentViewModel.prototype.setState = function(state) {
        //TODO
    };

    return SuperComponentViewModel;
});