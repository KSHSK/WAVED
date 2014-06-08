define(['jquery',
        'knockout',
        './Condition',
        'models/Constants/ComparisonOperator',
        'models/Constants/LogicalOperator',
        'util/defined'
    ],function(
        $,
        ko,
        Condition,
        ComparisonOperator,
        LogicalOperator,
        defined
    ){
    'use strict';

    /**
     * a and b are sorted arrays of indices.
     * Returns the intersection of the two arrays.
     */
    var intersection = function(a, b) {
        var ai = 0;
        var bi = 0;
        var result = [];

        while (ai < a.length && bi < b.length) {
            if (a[ai] < b[bi]) {
                ai++;
            }
            else if (a[ai] > b[bi]) {
                bi++;
            }
            else
            {
                result.push(a[ai]);
                ai++;
                bi++;
            }
        }

        return result;
    };

    /**
     * array contains array of indices to be unioned.
     */
    var unionAll = function(array) {
        var set = {};

        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array[i].length; j++) {
                set[array[i][j]] = true;
            }
        }

        var stringKeys = Object.keys(set);

        // Return as Number.
        return $.map(stringKeys, function(item) {
            return Number(item);
        });
    };

    var Query = function(state) {
        state = defined(state) ? state : {};

        this._currentConditions = undefined;
        this.conditions = [];
    };

    var execute = function(data, current) {
        // Select which set of conditions to use
        var conditions = current ? this.currentConditions : this.conditions;

        // Every entry is an array contaning the matching rows for that condition.
        var conditionIndices = [];

        // Run each condition separately.
        conditions.forEach(function(condition) {
            var indices = condition.execute(data);
            conditionIndices.push(indices);
        });

        // Join all of the AND conditions.
        var andIndices = [];
        for (var i = 0; i < conditions.length; i++) {
            var group = conditionIndices[i];
            while (conditions[i].logicalOperator === LogicalOperator.AND) {
                i++;
                group = intersection(group, conditionIndices[i]);
            }
            andIndices.push(group);
        }

        // Join the resulting indices by OR.
        var dataIndices = unionAll(andIndices);

        return data.filter(function(value, index) {
            return dataIndices.indexOf(index) !== -1;
        });
    };

    Query.getHelperFunctionsJs = function() {
        return '/**\n' +
            ' * a and b are sorted arrays of indices.\n' +
            ' * Returns the intersection of the two arrays.\n' +
            ' */\n' +
            'var intersection = ' +  intersection.toString() + ';\n\n' +
            '/**\n' +
            ' * array contains array of indices to be unioned.\n' +
            ' */\n' +
            'var unionAll = ' + unionAll.toString() + ';\n\n' +
            '/**\n' +
            ' * Return a function that computes which indices of data pass the\n' +
            ' * given condition on the given field based on the given value.\n' +
            ' */\n' +
            'var conditionFunction = function (field, condition, value) {\n' +
            '\treturn function(data) {\n' +
            '\t\tvar indices = [];\n' +
            '\t\tdata.forEach(function(row, index) {\n' +
            '\t\t\tvar fieldValue = row[field];\n' +
            '\t\t\tif(condition(fieldValue, value)) {\n' +
            '\t\t\t\tindices.push(index);\n' +
            '\t\t\t}\n' +
            '\t\t});\n\n' +
            '\t\treturn indices;\n' +
            '\t};\n' +
            '};\n\n';
    };

    Query.getDataFunctionJs = function(conditions, tabs) {
        var js = 'function(args) {\n';
        js += tabs + '\tvar group = [];\n';
        js += tabs + '\tvar andIndices = [];\n';
        js += tabs + '\tvar indicesFunction;\n\n';

        for (var i = 0; i < conditions.length; i++) {
            js += tabs + '\tindicesFunction = ' + conditions[i].getExecuteJs(tabs + '\t\t') + ';\n';
            js += tabs + '\tgroup = indicesFunction(this.loadedData);\n\n';
            while (conditions[i].logicalOperator === LogicalOperator.AND) {
                i++;
                js += tabs + '\tindicesFunction = ' + conditions[i].getExecuteJs(tabs + '\t\t') + ';\n';
                js += tabs + '\tgroup = intersection(group, indicesFunction(this.loadedData));\n';
            }
            js += tabs + '\tandIndices.push(group);\n\n';
        }

        js += tabs + '\tvar dataIndices = unionAll(andIndices)\n';
        js += tabs + '\tthis.data = this.loadedData.filter(function(value, index) {\n';
        js += tabs + '\t\treturn dataIndices.indexOf(index) !== -1;\n';
        js += tabs + '\t});\n';
        js += tabs + '};\n';

        return js;
    };

    Query.prototype.execute = function(data) {
        return execute.call(this, data, false);
    };

    Query.prototype.executeCurrent = function(data) {
        return execute.call(this, data, true);
    };

    Query.prototype.getState = function() {
        return {
            conditions: $.map(this.conditions, function(condition) {
                return condition.getState();
            })
        };
    };

    Query.prototype.setState = function(state) {
        var self = this;

        if (defined(state.conditions)) {
            self.conditions = $.map(state.conditions, function(conditionState) {
                if (conditionState instanceof Condition) {
                    return conditionState;
                }

                return new Condition(conditionState);
            });
        }
    };

    Query.prototype.reset = function() {
        this._currentConditions = undefined;
    };

    Object.defineProperties(Query.prototype, {
        currentConditions: {
            get: function() {
                return defined(this._currentConditions) ? this._currentConditions : this.conditions;
            },
            set: function(value) {
                this._currentConditions = value;
            }
        }
    });

    return Query;
});
