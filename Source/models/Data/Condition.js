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
        this.comparisonOperator = ''; // ComparisonOperator
        this.value = '';
        this.logicalOperator = ''; // LogicalOperator (optional)

        this.setState(state);
    };

    Condition.prototype.getState = function() {
        return {
            field: this.field,
            operator: this.operator,
            value: this.value,
            logicalOperator: this.logicalOperator
        };
    };

    Condition.prototype.setState = function(state) {
        if (defined(state.field)) {
            this.field = state.field;
        }

        if (defined(state.operator)) {
            this.operator = state.operator;
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