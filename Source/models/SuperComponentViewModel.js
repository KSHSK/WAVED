/*global define*/
define([
        'jquery',
        'knockout'
    ], function(
        $,
        defined,
        defaultValue,
        ko) {
    'use strict';

    var SuperComponentViewModel = function(state) {
        if (typeof state.name === 'undefined') {
            throw new Error('SuperComponentViewModel name is required');
        }

        this._name = state.name;

        ko.track(this);
    };

    Object.defineProperties(SuperComponentViewModel.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                this._name = value;
            }
        }
    });

    SuperComponentViewModel.prototype.getState = function() {
        //TODO
    };

    SuperComponentViewModel.prototype.setState = function(state) {
        //TODO
    };

    SuperComponentViewModel.prototype.getName = function() {
        // TODO
    };

    Object.defineProperties(SuperComponentViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name];
            }
        }
    });

    return SuperComponentViewModel;
});