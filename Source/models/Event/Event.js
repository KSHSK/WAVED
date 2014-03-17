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

    var Event = function(state) {
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        this._name = '';
        this._eventType = ''; // EventType
        this._triggeringComponent = {}; // ComponentViewModel
        this._trigger = {}; // Trigger
        this._actions = []; // Action[]

        this.setState(state);

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

    Event.prototype.setState = function(state) {

        if (defined(state.name)) {
            this._name = state.name;
        }

        if (defined(state.eventType)) {
            this._eventType = state.eventType; // EventType
        }

        if (defined(state.triggeringComponent)){
            this._triggeringComponent = state.triggeringComponent;
        }

        if (defined(state.trigger)){
            // TODO: Make sure this is one of the triggers found on the triggeringComponent.
            this._trigger = state.trigger;
        }

        if (defined(state.actions)){
            this._actions = state.actions;
        }
    };

    Event.prototype.getState = function() {
        return {
            'name': this._name,
            'eventType': this._eventType,
            'triggeringComponent': this._triggeringComponent.viewModel.name.value,
            'trigger': this._trigger.name,
            'actions': $.map(this._actions, function(action) {
                return action.name;
            })
        };
    };
    
    Event.prototype.subscriptions = [];

    Event.prototype.subscribeChanges = function(setDirty) {
        var self = this;

        var properties = [];
        for ( var prop in this) {
            if (this.hasOwnProperty(prop)) {
                properties.push(prop);
            }
        }

        properties.forEach(function(prop) {
            var subscription = ko.getObservable(self, prop).subscribe(function(newValue) {
                setDirty();
            });

            self.subscriptions.push(subscription);
        });
    };

    return Event;
});