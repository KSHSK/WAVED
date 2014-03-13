/*global define*/
define([
        'models/Action/Action',
        'models/Data/DataSet',
        'util/defined',
        'knockout',
        'jquery'
    ],function(
        Action,
        DataSet,
        defined,
        ko,
        $
    ){
    'use strict';

    var PropertyAction = function(state) {
        Action.call(this, state);

        this._newValues = {};

        this.setState(state);
        // TODO: Validation, etc
        // TODO: target visibility conflicts with Action _target visibility, issue?
        // TODO: Make private in order to do type checking, validation, etc? Update DD with decision

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    PropertyAction.getType = function() {
        return 'PropertyAction';
    };

    PropertyAction.prototype = Object.create(Action.prototype);

    Object.defineProperties(PropertyAction.prototype, {
        newValues: {
            get: function() {
                return this._newValues;
            },
            set: function(newValues) {
                this._newValues = newValues;
            }
        }
    });

    PropertyAction.prototype.setState = function(state) {
        Action.prototype.setState.call(this, state);

        if (defined(state.newValues)) {
            this._newValues = state.newValues;
        }

        if (this._applyAutomatically) {
            this.apply();
        }
    };

    PropertyAction.prototype.getState = function() {
        var state = Action.prototype.getState.call(this);
        $.extend(state, {
            'target': this._target.viewModel.name.value,
            'newValues': this._newValues,
            'type': PropertyAction.getType()
        });
        return state;
    };

    PropertyAction.getType = function() {
        return 'PropertyAction';
    };

    PropertyAction.prototype.apply = function() {
        var targetProperties = this._target.viewModel.properties;
        for (var key in this._newValues) {
            var value = this._newValues[key];
            for (var i = 0; i < targetProperties.length; i++) {
                if (targetProperties[i].displayName === key) {
                    this._target.viewModel.properties[i].value = this._newValues[key];
                }
            }
        }
    };

    return PropertyAction;
});