define(['jquery',
        'knockout',
        'models/Property/StringProperty',
        'modules/UniqueTracker',
        'util/createValidator',
        'util/defined',
        'util/subscribeObservable'
    ],function(
        $,
        ko,
        StringProperty,
        UniqueTracker,
        createValidator,
        defined,
        subscribeObservable
    ){
    'use strict';

    var Action = function(state) {
        state = defined(state) ? state : {};

        this._name = '';
        this._target = undefined;
        this._applyAutomatically  = false;

        ko.track(this);
    };

    Action.getUniqueNameNamespace = function() {
        return 'action-name';
    };

    Object.defineProperties(Action.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                var success = UniqueTracker.addValueIfUnique(Action.getUniqueNameNamespace(), value, this);
                if (success) {
                    this._name = value;
                }
            }
        },
        // TODO: These not in the DD, should be required
        target: {
            get: function() {
                return this._target;
            },
            set: function(target) {
                this._target = target;
            }
        },
        applyAutomatically: {
            get: function() {
                return this._applyAutomatically;
            },
            set: function(value) {
                this._applyAutomatically = value;
            }
        }
    });

    Action.prototype.setState = function(state) {
        if (defined(state.name)) {
            this.name = state.name;
        }

        // TODO: Does this need to be different for Property/Query Actions?
        if (defined(state.target)) {
            this._target = state.target;
        }

        if (defined(state.applyAutomatically)) {
            this._applyAutomatically = state.applyAutomatically;
        }
    };

    Action.prototype.getState = function() {
        return {
            'name': this._name,
            'applyAutomatically': this._applyAutomatically
        };
    };

    Action.prototype.subscribed = false;

    Action.prototype.subscribeChanges = function(propertyChangeSubscriber) {
        var self = this;

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

    return Action;
});