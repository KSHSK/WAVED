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
        this._eventType = ''; // EventType
        this._triggeringWidget = {}; // WidgetViewModel
        this._actions = []; // Action[]

        this.applyActions = function() {
            for (var i = 0; i < self.actions.length; i++) {
                self.actions[i].apply(self._triggeringWidget.viewModel.trigger.data);
            }
        };

        this.fireEvent = function(event) {
            var workspace = $('#waved-workspace');
            self._triggeringWidget.viewModel.trigger.data.x =  100 * (event.pageX - workspace.offset().left) / workspace.width();
            self._triggeringWidget.viewModel.trigger.data.y = 100 * (event.pageY - workspace.offset().top) / workspace.height();

            self.applyActions();
        };

        this.register = function() {
            if (defined(self._triggeringWidget)) {
                $(self._triggeringWidget.viewModel.trigger.domElement).on(EventType[self._eventType], self.fireEvent);
            }
        };

        this.unregister = function() {
            if (defined(self._triggeringWidget)) {
                $(self._triggeringWidget.viewModel.trigger.domElement).off(EventType[self._eventType], self.fireEvent);
            }
        };

        this.setState(state);

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
                this.unregister();
                this._eventType = value;
                this.register();
            }
        },
        triggeringWidget: {
            get: function() {
                return this._triggeringWidget;
            },
            set: function(value) {
                this.unregister();
                this._triggeringWidget = value;
                this.register();
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

        if (defined(state.triggeringWidget)){
            this._triggeringWidget = state.triggeringWidget;
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

            // Subscribe redo change.
            propertyChangeSubscriber.subscribeChange(self, prop);
        });

        this.subscribed = true;
    };

    return Event;
});