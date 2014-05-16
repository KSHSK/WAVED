define([
        'models/Action/Action',
        'models/Data/DataSubset',
        'models/Constants/ActionType',
        'models/Data/Condition',
        'util/defined',
        'knockout',
        'jquery'
    ],function(
        Action,
        DataSubset,
        ActionType,
        Condition,
        defined,
        ko,
        $
    ){
    'use strict';

    var QueryAction = function(state, getDataSubset) {
        Action.call(this, state);

        this._dataSubset = undefined; // DataSubset
        this._conditions = []; // Condition[]
        this.getDataSubset = getDataSubset;

        this.setState(state);

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    QueryAction.getType = function() {
        return ActionType.QUERY_ACTION;
    };

    QueryAction.prototype = Object.create(Action.prototype);

    QueryAction.prototype.getType = function() {
        return QueryAction.getType();
    }

    Object.defineProperties(QueryAction.prototype, {
        dataSubset: {
            get: function() {
                return this._dataSubset;
            },
            set: function(dataSubset) {
                this._dataSubset = dataSubset;
            }
        },
        conditions: {
            get: function() {
                return this._conditions;
            },
            set: function(conditions) {
                var self = this;
                this._conditions.length = 0;
                conditions.forEach(function(condition) {
                    self._conditions.push(new Condition(condition.getState()));
                });
            }
        }
    });

    QueryAction.prototype.setState = function(state) {
        var self = this;
        // TODO: Validation, etc
        if (defined(state.dataSubset)) {
            this.dataSubset = this.getDataSubset(state.dataSubset);
        }

        if (defined(state.conditions)) {
            this.conditions.length = 0;
            state.conditions.forEach(function(condition) {
                self.conditions.push(new Condition(condition));
            });
        }

        Action.prototype.setState.call(this, state);
    };

    QueryAction.prototype.getState = function() {
        var state = Action.prototype.getState.call(this);
        state.type = QueryAction.getType();
        state.dataSubset = this._dataSubset.name;
        state.conditions = this._conditions.map(function(condition) {
            return condition.getState();
        });
        return state;
    };

    return QueryAction;
});
