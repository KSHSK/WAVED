define([
        'models/ComponentViewModel',
        'models/Constants/EventType',
        'models/Action/Action',
        'models/Event/Trigger',
        'knockout',
        'util/defined'
    ],function(
        ComponentViewModel,
        EventType,
        Action,
        Trigger,
        ko,
        defined
    ){
    'use strict';

    var Event = function(state) {
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        this._name = state.name; // StringProperty
        this._eventType = state.eventType; // EventType
        this._triggeringComponent = state.triggeringComponent; // ComponenetViewModel
        this._trigger = undefined; // Trigger
        this._action = state.action; // Action

        ko.track(this);
    };

    Object.defineProperties(Event.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                this._name = value;
            }
        },
        eventType: {
            get: function() {
                return this._eventType;
            }
        // TODO: Why does this not have a setter? Update DD with decision.
        },
        triggeringComponent: {
            get: function() {
                return this._triggeringComponent;
            },
            set: function(value) {
                this._triggeringComponent = value;
            }
        },
        trigger: {
            get: function() {
                return this._trigger;
            },
            set: function(value) {
                this._trigger = value;
            }
        },
        action: {
            get: function() {
                return this._action;
            },
            set: function(value) {
                this._action = value;
            }
        }
    });

    return Event;
});