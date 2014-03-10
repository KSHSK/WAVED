/*global define*/
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

        // TODO: Name Validation
        this._name = new StringProperty({
            displayName: 'Name',
            value: state.name
        });
        this._target = state.target; // Any TODO: Get the actual target
        this._values = state.values;
        this._applyAutomatically = state.applyAutomatically; // Boolean

        if (this._applyAutomatically) {
            this.apply();
        }

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
        },
        values: {
            get: function() {
                return this._values;
            },
            set: function(value) {
                this._values = value;
            }
        }
    });

    Action.prototype.apply = function() {
        for (var i = 0; i < this._values.length; i++) {
            this._target.viewModel.properties[i].value = this._values[i];
        }
    };

    return Action;
});