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

    return Action;
});