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
        this._target = state.target; // QueryNode
        this._dataSet = state.dataSet; // DataSet
        this._newValues = state.newValues; // Object

        ko.track(this);
    };

    PropertyAction.prototype = Object.create(Action.prototype);

    return PropertyAction;
});