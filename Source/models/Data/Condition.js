define([
        'knockout',
        'util/defined'
    ],function(
        ko,
        defined
    ){
    'use strict';

    // TODO: Should we pass in a ConditionalOperatorValue or a state Object? Update DD with decision
    var Condition = function(field, operator, value) {
        // TODO: Validation, etc
        this.field = undefined; // String
        this.operator = value; // ComparisonOperatorValue
        this.value = undefined; // String

    };

    return Condition;
});