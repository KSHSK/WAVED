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

    Object.defineProperties(QueryAction.prototype, {
        type : {
            get: function() {
                return QueryAction.getType();
            }
        },
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
        if (defined(state.dataSubset)) {
            this.dataSubset = this.getDataSubset(state.dataSubset);
        }

        if (defined(state.conditions)) {
            this.conditions.length = 0;
            if (state.conditions instanceof Array) {
                state.conditions.forEach(function(condition) {
                    self.conditions.push(new Condition(condition));
                });
            }
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

    QueryAction.prototype.apply = function(data) {
        // Deep copy of conditions with templates so they can be replaced
        var conditions = this.conditions.map(function(condition) {
            return new Condition(condition.getState());
        });

        function getTemplateMatches(str) {
            var index = 1;
            var matches = [];
            var templateRegex = /{{([ _.\w]+)}}/g;
            var match;
            while ((match = templateRegex.exec(str)) !== null) {
                matches.push(match[index]);
            }
            return matches;
        }

        // Loop through every condition to replace any templated arguments with the relevant values from the data given
        for (var j = 0; j < conditions.length; j++) {
            var condition = conditions[j];
            var templates = getTemplateMatches(condition.value);
            for (var i = 0; i < templates.length; i++) {
                if (defined(data.trigger) && defined(data.trigger[templates[i]])) {
                    condition.value = condition.value.replace('{{' + templates[i]+ '}}', data.trigger[templates[i]]);
                } else {
                    var components = templates[i].split('.');
                    if (components.length > 1) {
                        if (defined(data[components[0]]) && defined(data[components[0]][components[1]])) {
                            condition.value = condition.value.replace('{{' + templates[i]+ '}}', data[components[0]][components[1]]);
                        }
                    }
                }
            }
        }

        // Update and run the query with the new current conditions
        this.dataSubset.query.currentConditions = conditions;
        this.dataSubset.executeCurrentQuery();
    };

    QueryAction.prototype.getDataFunctionJs = function(tabs) {
        return Condition.getDataFunctionJs(this.condtions, tabs);
    };

    QueryAction.prototype.getJs = function(tabs) {
        return tabs + 'dataSets[\'' + this.dataSubset.name + '\'].getData = ' + this.getDataFunctionJs(tabs) +
            tabs + 'dataSets[\'' + this.dataSubset.name + '\'].onChange.forEach(function(callback) {\n' +
            tabs + '\tcallback();\n' +
            tabs + '});\n';
    };

    return QueryAction;
});
