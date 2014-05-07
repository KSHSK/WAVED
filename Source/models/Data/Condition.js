define([
        'jquery',
        'knockout',
        'models/Constants/ComparisonOperator',
        'util/defined'
    ],function(
        $,
        ko,
        ComparisonOperator,
        defined
    ){
    'use strict';

    var Condition = function(state) {
        state = (defined(state)) ? state : {};

        this.field = '';
        this.comparisonOperator = undefined; // ComparisonOperator
        this.value = '';
        this.logicalOperator = undefined; // LogicalOperator (optional)

        this.setState(state);
    };

    Condition.prototype.getState = function() {
        return {
            field: this.field,
            comparisonOperator: this.comparisonOperator,
            value: this.value,
            logicalOperator: this.logicalOperator
        };
    };

    Condition.prototype.setState = function(state) {
        if (defined(state.field)) {
            this.field = state.field;
        }

        if (defined(state.comparisonOperator)) {
            this.comparisonOperator = state.comparisonOperator;
        }

        if (defined(state.value)) {
            this.value = state.value;
        }

        if (defined(state.logicalOperator)) {
            this.logicalOperator = state.logicalOperator;
        }
    };

    return Condition;
});