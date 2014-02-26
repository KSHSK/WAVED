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

    var LogicalOperator = function(value) {

        // TODO: Validation, etc
        this._operator = value; // LogicalOperatorValue

    };

    LogicalOperator.prototype = Object.create(QueryNodeValue.prototype);

    return LogicalOperator;
});