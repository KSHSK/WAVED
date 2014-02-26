/*global define*/
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

    var Condition = function(field, operator, value) {

        // TODO: Validation, etc
        this._field = undefined; // String
        this._operator = value; // ComparisonOperatorValue
        this._value = undefined; // String

    };

    Condition.prototype = Object.create(QueryNodeValue.prototype);

    return Condition;
});