/*global define*/
define([
        'models/ComponentViewModel',
        'models/Constants/EventType',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'models/Event/Trigger',
        'models/Property/StringProperty',
        'util/defined',
        'knockout',
        'jquery'
    ],function(
        ComponentViewModel,
        EventType,
        Action,
        PropertyAction,
        QueryAction,
        Trigger,
        StringProperty,
        defined,
        ko,
        $
    ){
    'use strict';

    var Event = function(state, availableWidgets) {
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        this._name = new StringProperty({
            displayName: 'Name',
            value: ''
        });

        this._eventType = ''; // EventType
        this._triggeringComponent = {}; // ComponentViewModel
        this._trigger = {}; // Trigger
        this._actions = []; // Action[]

        this.setState(state, availableWidgets);

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

    Event.prototype.setState = function(state, availableWidgets) {

        if (defined(state.name)) {
            this._name.value = state.name;
        }

        if (defined(state.eventType)) {
            this._eventType = state.eventType; // EventType
        }

        if (defined(state.triggeringComponent)){
            this._triggeringComponent = state.triggeringComponent;
        }

        if (defined(state.trigger)){
            this._trigger = state.trigger;
        }

        if (defined(state.actions)){
            this._actions = $.map(state.actions, function(itemState) {
                if (itemState.type === PropertyAction.getType()) {
                    return new PropertyAction(itemState);
                }

                if (itemState.type === QueryAction.getType()) {
                    return new QueryAction(itemState);
                }

                // Invalid state.
                return null;
            });
        }
    };

    Event.prototype.getState = function() {
        return {
            'name': this._name.value,
            'eventType': this._eventType,
            'triggeringComponent': this._triggeringComponent.name.value,
            'trigger': this._trigger.name,
            'actions': $.map(this._actions, function(action) {
                return action.name.value;
            })
        };

    };

    return Event;
});