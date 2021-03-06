define([
        'models/Widget/GraphWidget/GraphViewModel',
        'util/defined',
        'knockout'
    ],function(
        GraphViewModel,
        defined,
        ko){
    'use strict';

    var LineGraphViewModel = function(state) {
        state = (defined(state)) ? state : {};

        GraphViewModel.call(this, state);

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    LineGraphViewModel.getType = function() {
        return 'LineGraph';
    };

    LineGraphViewModel.prototype = Object.create(GraphViewModel.prototype);

    LineGraphViewModel.prototype.getState = function() {
        // TODO;
    };

    LineGraphViewModel.prototype.setState = function(state) {
        // TODO;
    };

    return LineGraphViewModel;
});