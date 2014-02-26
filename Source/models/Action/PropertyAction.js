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
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        // TODO: target visibility conflicts with Action _target visibility, issue?
        this.target = state.target; // String
        this.dataSet = state.dataSet; // DataSet
        this.newValues = state.newValues; // Object

        ko.track(this);
    };

    PropertyAction.prototype = Object.create(Action.prototype);

    return PropertyAction;
});