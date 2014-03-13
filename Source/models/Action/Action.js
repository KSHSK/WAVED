define(['jquery',
        'knockout',
        'models/Property/StringProperty',
        'util/createValidator',
        'util/defined'
    ],function(
        $,
        ko,
        StringProperty,
        createValidator,
        defined
    ){
    'use strict';

    var Action = function(state) {
        state = defined(state) ? state : {};

        this._name = '';
        this._target = undefined;
        this._applyAutomatically  = false;

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

    Action.prototype.setState = function(state) {
        if (defined(state.name)) {
            // TODO: Name Validation
            this._name = state.name;
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

    return Action;
});