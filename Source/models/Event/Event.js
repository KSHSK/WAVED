define([
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
        this.eventType = ''; // EventType
        this.riggeringWidget = {}; // WidgetViewModel
        this.trigger = {}; // Trigger
        this.actions = []; // Action[]

        this.setState(state);

        this.applyActions = function() {
            for (var i = 0; i < self.actions.length; i++) {
                // TODO: pass in information from trigger as a param?
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

        this.subscribed = false;
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
        }
    });

    Event.prototype.setState = function(state) {
        if (defined(state.name)) {
            this.name = state.name;
        }

        if (defined(state.eventType)) {
            this._eventType = state.eventType; // EventType
        }

        if (defined(state.triggeringWidget)){
            this._triggeringWidget = state.triggeringWidget;
        }

        if (defined(state.trigger)){
            this._trigger = this._triggeringWidget.viewModel.triggers[state.trigger];
        }

        if (defined(state.actions)){
            this._actions = state.actions;
        }
    };

    Event.prototype.getState = function() {
        return {
            'name': this._name,
            'eventType': this._eventType,
            'triggeringWidget': this._triggeringWidget.viewModel.name.value,
            'trigger': this._triggeringWidget.viewModel.triggers.indexOf(this._trigger),
            'actions': $.map(this._actions, function(action) {
                return action.name;
            })
        };
    };

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

            // Subscribe redo change.
            propertyChangeSubscriber.subscribeChange(self, prop);
        });

        this.subscribed = true;
    };

    return Event;
});