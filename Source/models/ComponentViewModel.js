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
        this.visible = new BooleanProperty({
            displayName: 'Visible',
            value: true,
        });

        // Set logGoogleAnalytics
        this.logGoogleAnalytics = new BooleanProperty({
            displayName: 'Log Google Analytics',
            value: false,
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
        SuperComponentViewModel.prototype.setState.call(this, state);

        if (defined(state.visible)) {
            this.visible.value = state.visible.value;
        }

        if (defined(state.logGoogleAnalytics)) {
            this.logGoogleAnalytics.value = state.logGoogleAnalytics.value;
        }
    };

    ComponentViewModel.prototype.getTriggers = function() {
        // TODO
    };

    Object.defineProperties(ComponentViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.visible, this.logGoogleAnalytics];
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