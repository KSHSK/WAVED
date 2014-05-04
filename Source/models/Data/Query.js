define(['jquery',
        'knockout',
        './Condition',
        'util/defined'
    ],function(
        $,
        ko,
        Condition,
        defined
    ){
    'use strict';

    /**
     * Contains one or more conditions.
     */
    var Query = function(state) {
        state = defined(state) ? state : {};

        this.conditions = [];
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
            state.conditions.forEach(function(conditionState) {
                self.conditions.push(new Condition(conditionState));
            });
        }
    };

    return Query;
});