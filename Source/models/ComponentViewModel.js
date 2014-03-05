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

        var visibleOptions;
        if (defined(state.visible)) {
            visibleOptions = {
                displayName: state.visible.displayName,
                value: state.visible.value
            };
        }
        else {
            visibleOptions = {
                displayName: 'Visible',
                value: true
            };
        }
        this.visible = new BooleanProperty(visibleOptions);

        var gaOptions;
        if (defined(state.logGoogleAnalytics)) {
            gaOptions = {
                displayName: state.logGoogleAnalytics.displayName,
                value: state.logGoogleAnalytics.value
            };
        }
        else {
            gaOptions = {
                displayName: 'Log Google Analytics',
                value: false
            };
        }
        this.logGoogleAnalytics = new BooleanProperty(gaOptions);

        // TODO: Validation, creation of actual Property objects, etc
        this._parentWidgetName = defaultValue(state.parent, undefined); // String

        // TODO: Should this be static?
        this._triggers = []; // Trigger[]

        ko.track(this);
    };

    ComponentViewModel.prototype = Object.create(SuperComponentViewModel.prototype);

    ComponentViewModel.prototype.getState = function() {
        var state = SuperComponentViewModel.prototype.getState.call(this);
        state['visible'] = this.visible.getState();
        state['logGoogleAnalytics'] = this.logGoogleAnalytics.getState();

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