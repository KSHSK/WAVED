/*global define*/
define([
        'models/SuperComponentViewModel',
        'models/Event/Trigger',
        'jquery',
        'knockout'
    ], function(
        SuperComponentViewModel,
        Trigger,
        $,
        ko) {
    'use strict';

    var ComponentViewModel = function(state) {
        if (typeof state.name === 'undefined') {
            throw new Error('SuperComponentViewModel name is required');
        }

        this._visible = state.visible; // BooleanProperty
        this._logGoogleAnalytics = state.logGoogleAnalytics; // BooleanProperty
        this._parentWidgetName = state.parentWidgetName; // String
        this._triggers = []; // Trigger[]

        ko.track(this);
    };

    ComponentViewModel.prototype = Object.create(SuperComponentViewModel.prototype);

    ComponentViewModel.prototype.getState = function() {
        //TODO
    };

    ComponentViewModel.prototype.setState = function(state) {
        //TODO
    };

    ComponentViewModel.prototype.getTriggers = function() {
        // TODO
    };

    Object.defineProperties(SuperComponentViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name];
            }
        }
    });

    return ComponentViewModel;
});