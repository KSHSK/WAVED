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
        this._name = state.name; // String

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

    return Trigger;
});