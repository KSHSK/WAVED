/*global define*/
define([
        'models/Action/Action',
        'models/Data/DataSubset',
        'models/Data/QueryNode',
        'knockout',
        'util/defined'
    ],function(
        Action,
        DataSubset,
        QueryNode,
        ko,
        defined
    ){
    'use strict';

    var QueryAction = function(state) {
        state = defined(state) ? state : {};

        // TODO: Validation, etc
        this._target = state.target; // DataSubset
        this._newValues = state.newValues; // Object

        ko.track(this);
    };

    QueryAction.prototype = Object.create(Action.prototype);

    return QueryAction;
});