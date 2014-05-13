define([
        'models/Action/Action',
        'models/Data/DataSubset',
        'util/defined',
        'knockout',
        'jquery'
    ],function(
        Action,
        DataSubset,
        defined,
        ko,
        $
    ){
    'use strict';

    var QueryAction = function(state) {
        Action.call(this, state);

        // TODO: Validation, etc
        // TODO: target visibility conflicts with Action _target visibility, issue?
        this._target = state.target; // DataSubset
        // TODO: Rename this to something that makes more sense.
        this._newValues = state.newValues; // QueryNode

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    QueryAction.getType = function() {
        return 'QueryAction';
    };

    QueryAction.prototype = Object.create(Action.prototype);

    QueryAction.getType = function() {
        return 'QueryAction';
    };

    QueryAction.prototype.setState = function(state) {

        if (defined(state.newValues)) {
            // TODO: Determine how to handle QueryNode
            this._newValues = state.newValues;
        }

        Action.prototype.setState.call(this, state);
    };

    QueryAction.prototype.getState = function() {
        var state = Action.prototype.getState.call(this);
        state.type = QueryAction.getType();
        state.target = this._target.viewModel.name.value;
        return state;
    };

    return QueryAction;
});