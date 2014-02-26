/*global define*/
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

    LineGraphViewModel.prototype = Object.create(GraphViewModel.prototype);

    LineGraphViewModel.prototype.getState = function() {
        //TODO;
    };

    LineGraphViewModel.prototype.setState = function(state) {
        //TODO;
    };

    Object.defineProperties(LineGraphViewModel.prototype, {
        properties: {
            get: function() {
                return [ /* TODO */ ];
            }
        }
    });

    return LineGraphViewModel;
});