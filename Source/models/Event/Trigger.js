define(['knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    var Trigger = function(state) {
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        this._name = ''; // String

        this.setState(state);

        ko.track(this);
    };

    Object.defineProperties(Trigger.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                this._name = value;
            }
        }
    });

    Trigger.prototype.setState = function(state) {
        if (defined(state.name)) {
            this._name = state.name;
        }
    };

    Trigger.prototype.getState = function() {
        return {
            'name': name
        };
    };

    return Trigger;
});