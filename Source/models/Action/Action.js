/*global define*/
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
        this._name = state.name; // String
        this._target = state.target; // TODO: Get the actual target
        this._applyAutmatically = state.applyAutomatically; // Boolean

       var apply = function() {

       };

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
        }
    });

    return Action;
});