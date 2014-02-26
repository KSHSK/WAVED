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
            throw new Error('ComponentViewModel name is required');
        }

        // TODO: Validation, creation of actual Property objects, etc
        this.visible = state.visible; // BooleanProperty
        this.logGoogleAnalytics = state.logGoogleAnalytics; // BooleanProperty
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

    Object.defineProperties(ComponentViewModel.prototype, {
        properties: {
            get: function() {
                // TODO: Mixed visibilities make this look weird? Problem?
                return [this._name, this.visible, this.logGoogleAnalytics, this._parentWidgetName];
            }
        },
        triggers: {
            get: function() {
                return this._triggers;
            }
        }
    });

    return ComponentViewModel;
});