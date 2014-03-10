/*global define*/
define([
        'models/ComponentViewModel',
        'models/Constants/EventType',
        'models/Action/Action',
        'models/Event/Trigger',
        'models/Property/StringProperty',
        'knockout',
        'util/defined'
    ],function(
        ComponentViewModel,
        EventType,
        Action,
        Trigger,
        StringProperty,
        ko,
        defined
    ){
    'use strict';

    var Event = function(state) {
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        this._name = new StringProperty({
            displayName: 'Name',
            value: state.name
        });
        this._eventType = state.eventType; // EventType
        this._triggeringComponent = state.triggeringComponent; // ComponentViewModel
        this._trigger = state.trigger; // Trigger
        this._actions = []; // Action[]
        this._actions.push(state.actions);

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
            },
            set: function(value) {
                this._eventType = value;
            }
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
        actions: {
            get: function() {
                return this._actions;
            },
            set: function(value) {
                this._actions = value;
            }
        }
    });

    return Event;
});