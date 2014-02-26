/*global define*/
define([
        'models/Widget/WidgetViewModel',
        'util/defined',
        'knockout'
    ],function(
        WidgetViewModel,
        defined,
        ko){
    'use strict';

    var GraphViewModel = function(options) {
        options = (defined(options)) ? options : {};

        WidgetViewModel.call(this, options);

        ko.track(this);
    };

    GraphViewModel.prototype = Object.create(WidgetViewModel.prototype);

    GraphViewModel.prototype.getState = function() {
        //TODO;
    };

    GraphViewModel.prototype.setState = function(state) {
        //TODO;
    };

    Object.defineProperties(GraphViewModel.prototype, {
        properties: {
            get: function() {
                return [ /* TODO */ ];
            }
        }
    });

    return GraphViewModel;
});