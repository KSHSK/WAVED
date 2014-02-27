/*global define*/
define([
        'models/Data/QueryNodeValue',
        'models/Constants/LogicalOperatorValue',
        'knockout',
        'util/defined'
    ],function(
        QueryNodeValue,
        LogicalOperatorValue,
        ko,
        defined
    ){
    'use strict';

    // TODO: Should we pass in a LogicalOperatorValue or a state Object? Update DD with decision
    var LogicalOperator = function(value) {
        QueryNodeValue.call(this); // TODO: Necessary super call?

        // TODO: Validation, etc
        this._operator = value; // LogicalOperatorValue

    };

    LogicalOperator.prototype = Object.create(QueryNodeValue.prototype);

    return LogicalOperator;
});