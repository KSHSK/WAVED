/*global define*/
define([
        'models/Action/Action',
        'models/Data/DataSet',
        'knockout',
        'util/defined'
    ],function(
        Action,
        DataSet,
        ko,
        defined
    ){
    'use strict';

    var PropertyAction = function(state) {
        Action.call(this, state);

        this.setState(state);
        // TODO: Validation, etc
        // TODO: target visibility conflicts with Action _target visibility, issue?
        // TODO: Make private in order to do type checking, validation, etc? Update DD with decision

        ko.track(this);
    };

    PropertyAction.prototype = Object.create(Action.prototype);

    PropertyAction.prototype.setState = function(state) {
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

    PropertyAction.prototype.getState = function() {
        return {
            'name': this._name.value,
            'target': this._target.viewModel.name.value,
            'values': this._values,
            'applyAutomatically': this._applyAutomatically
        };
    };

    PropertyAction.getType = function() {
        return 'PropertyAction';
    };

    PropertyAction.prototype.apply = function() {
        for (var i = 0; i < this._values.length; i++) {
            this._target.viewModel.properties[i].value = this._values[i];
        }
    };

    return PropertyAction;
});