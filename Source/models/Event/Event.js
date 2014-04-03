define([
        'models/ComponentViewModel',
        'models/Constants/EventType',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'models/Event/Trigger',
        'models/Property/StringProperty',
        'modules/UniqueTracker',
        'modules/PropertyChangeSubscriber',
        'util/defined',
        'util/subscribeObservable',
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
        UniqueTracker,
        PropertyChangeSubscriber,
        defined,
        subscribeObservable,
        ko,
        $
    ){
    'use strict';

    var Event = function(state) {
        var self = this;
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        this._name = '';
        this._eventType = ''; // EventType
        this._triggeringComponent = {}; // ComponentViewModel
        this._trigger = {}; // Trigger
        this._actions = []; // Action[]

        this.setState(state);

        this.applyActions = function() {
            for (var i = 0; i < self.actions.length; i++) {
                self.actions[i].apply();
            }
        };

        this.register = function() {
            $(self._trigger.domElement).on(EventType[self._eventType], self.applyActions);
        };

        this.unregister = function() {
            $(self._trigger.domElement).off(EventType[self._eventType], self.applyActions);
        };

        ko.track(this);
    };

    Event.getUniqueNameNamespace = function() {
        return 'event-name';
    };

    Object.defineProperties(Event.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                var success = UniqueTracker.addValueIfUnique(Event.getUniqueNameNamespace(), value, this);
                if (success) {
                    this._name = value;
                }
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
            this.name = state.name;
        }

        if (defined(state.eventType)) {
            this._eventType = state.eventType; // EventType
        }

        if (defined(state.triggeringComponent)){
            this._triggeringComponent = state.triggeringComponent;
        }

        if (defined(state.trigger)){
            this._trigger = this._triggeringComponent.viewModel.triggers[state.trigger];
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
            'trigger': this._triggeringComponent.viewModel.triggers.indexOf(this._trigger),
            'actions': $.map(this._actions, function(action) {
                return action.name;
            })
        };
    };

    Event.prototype.subscribed = false;

    Event.prototype.subscribeChanges = function() {
        var self = this;
        var propertyChangeSubscriber = PropertyChangeSubscriber.getInstance();

        var properties = [];
        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                properties.push(prop);
            }
        }

        properties.forEach(function(prop) {
            // Subscribe undo change.
            propertyChangeSubscriber.subscribeBeforeChange(self, prop);

            // Subscribe redo and dirty changes.
            propertyChangeSubscriber.subscribeChange(self, prop);
        });

        this.subscribed = true;
    };

    return Event;
});