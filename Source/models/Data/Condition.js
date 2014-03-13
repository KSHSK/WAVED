define([
        'models/Data/QueryNodeValue',
        'models/Constants/ComparisonOperatorValue',
        'knockout',
        'util/defined'
    ],function(
        QueryNodeValue,
        ComparisonOperatorValue,
        ko,
        defined
    ){
    'use strict';

    // TODO: Should we pass in a ConditionalOperatorValue or a state Object? Update DD with decision
    var Condition = function(field, operator, value) {
        QueryNodeValue.call(this); // TODO: Necessary super call?

        // TODO: Validation, etc
        this.field = undefined; // String
        this.operator = value; // ComparisonOperatorValue
        this.value = undefined; // String

    };

    Condition.prototype = Object.create(QueryNodeValue.prototype);

    return Condition;
});