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

        // TODO: Validation, etc
        // TODO: target visibility conflicts with Action _target visibility, issue?
        // TODO: Make private in order to do type checking, validation, etc? Update DD with decision
        this.target = state.target; // String
        this.dataSet = state.dataSet; // DataSet
        this.newValues = state.newValues; // Object

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    PropertyAction.getType = function() {
        return 'PropertyAction';
    };

    PropertyAction.prototype = Object.create(Action.prototype);

    return PropertyAction;
});