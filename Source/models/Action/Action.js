define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var Action = function(state) {
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        this._name = state.name; // StringProperty
        this._target = state.target; // Any TODO: Get the actual target
        this._applyAutomatically = state.applyAutomatically; // Boolean

        ko.track(this);
    };

    Object.defineProperties(Action.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                this._name = value;
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

    Action.prototype.apply = function() {
        // TODO
    };

    return Action;
});