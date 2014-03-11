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

        this._name = new StringProperty({
            displayName: 'Name',
            value: ''
        });
        this._target = {};
        this._applyAutomatically  = false;
        this._values = [];

        this.setState(state);

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

    Action.prototype.setState = function(state) {

        if (defined(state.name)) {
            // TODO: Name Validation
            this._name.value = state.name;
        }

        if (defined(state.target)) {
            this._target = state.target;
        }

        if (defined(state.applyAutomatically)) {
            this._applyAutomatically = state.applyAutomatically;
        }

        if (defined(state.values)) {
            this._values = state.values;
        }

        if (this._applyAutomatically) {
            this.apply();
        }
    };

    Action.prototype.getState = function() {
        return {
            'name': this._name.value,
            'target': this._target.getState(),
            'values': this._values,
            'applyAutomatically': this._applyAutomatically
        };
    };

    Action.prototype.apply = function() {
        for (var i = 0; i < this._values.length; i++) {
            this._target.viewModel.properties[i].value = this._values[i];
        }
    };

    return Action;
});