/*global define*/
define([
        'models/SuperComponentViewModel',
        'models/Event/Trigger',
        'models/Property/BooleanProperty',
        'jquery',
        'util/defined',
        'util/defaultValue',
        'knockout'
    ], function(
        SuperComponentViewModel,
        Trigger,
        BooleanProperty,
        $,
        defined,
        defaultValue,
        ko) {
    'use strict';

    var ComponentViewModel = function(state) {
        SuperComponentViewModel.call(this, state);

        // Set visible
        var visibleValue = true;
        if (defined(state.visible)) {
            visibleValue = state.visible.value;
        }

        this.visible = new BooleanProperty({
            displayName: 'Visible',
            value: visibleValue,
        });

        // Set logGoogleAnalytics
        var gaValue = false;
        if (defined(state.logGoogleAnalytics)) {
            gaValue = state.logGoogleAnalytics.value;
        }

        this.logGoogleAnalytics = new BooleanProperty({
            displayName: 'Log Google Analytics',
            value: gaValue,
        });

        // TODO: Should this be static?
        this._triggers = []; // Trigger[]

        ko.track(this);
    };

    ComponentViewModel.prototype = Object.create(SuperComponentViewModel.prototype);

    ComponentViewModel.prototype.getState = function() {
        var state = SuperComponentViewModel.prototype.getState.call(this);
        state.visible = this.visible.getState();
        state.logGoogleAnalytics = this.logGoogleAnalytics.getState();

        return state;
    };

    ComponentViewModel.prototype.setState = function(state) {
        // TODO
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