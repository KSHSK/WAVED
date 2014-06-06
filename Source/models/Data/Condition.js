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

    // Prepare the comparison functions.
    var comparisonFunctions = {};

    comparisonFunctions[ComparisonOperator.EQUAL] = function(a, b) {
        return a === b;
    };

    comparisonFunctions[ComparisonOperator.NOT_EQUAL] = function(a, b) {
        return a !== b;
    };

    comparisonFunctions[ComparisonOperator.LESS_THAN] = function(a, b) {
        return a < b;
    };

    comparisonFunctions[ComparisonOperator.LESS_THAN_OR_EQUAL] = function(a, b) {
        return a <= b;
    };

    comparisonFunctions[ComparisonOperator.GREATER_THAN] = function(a, b) {
        return a > b;
    };

    comparisonFunctions[ComparisonOperator.GREATER_THAN_OR_EQUAL] = function(a, b) {
        return a >= b;
    };

    // Condition class.
    var Condition = function(state) {
        state = (defined(state)) ? state : {};

        this.field = '';
        this.comparisonOperator = undefined; // ComparisonOperator
        this.value = '';
        this.logicalOperator = undefined; // LogicalOperator (optional)

        this.setState(state);
    };

    Condition.prototype.execute = function(data) {
        var self = this;
        var indices = [];

        data.forEach(function(row, index) {
            var fieldValue = row[self.field];
            if (comparisonFunctions[self.comparisonOperator](fieldValue, self.value)) {
                indices.push(index);
            }
        });

        return indices;
    };

    Condition.prototype.getExecuteJs = function(tabs) {
        var js = 'function(data) {\n';
        js += tabs + '\tvar indicies = [];\n';
        js += tabs + '\tdata.forEach(function(row, index) {\n';
        js += tabs + '\t\tvar fieldValue = row[\'' + this.field + '\'];\n';
        // TODO: quotes around this.value only if string?
        js += tabs + '\t\tif((' + comparisonFunctions[this.comparisonOperator].toString().replace(/\n|\r/g, "") + ')(fieldValue, \'' + this.value + '\')) {\n';
        js += tabs + '\t\t\tindicies.push(index);\n';
        js += tabs + '\t\t}\n';
        js += tabs + '\t};\n\n';
        js += tabs + '\treturn indices;\n';
        js += tabs + '}\n';

        return js;
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

    Condition.getDataFunctionJs = function(conditions, tabs) {
        // TODO return function that filters 'this.loadedData' given the list of conditions
        return 'function(args) {\n' +
            tabs + '\tthis.data = this.loadedData;\n' +
            tabs + '};\n';
    };

    return Condition;
});
