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
        Action.call(this, state);

        // TODO: Validation, etc
        // TODO: target visibility conflicts with Action _target visibility, issue?
        this.target = state.target; // DataSubset
        this.newValues = state.newValues; // QueryNode

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    QueryAction.getType = function() {
        return 'QueryAction';
    };

    QueryAction.prototype = Object.create(Action.prototype);

    return QueryAction;
});