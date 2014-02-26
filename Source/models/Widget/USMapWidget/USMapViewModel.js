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

    var USMapViewModel = function(state) {
        state = (defined(state)) ? state : {};

        WidgetViewModel.call(this, state);

        ko.track(this);
    };

    USMapViewModel.prototype = Object.create(WidgetViewModel.prototype);

    USMapViewModel.prototype.getState = function() {
        //TODO;
    };

    USMapViewModel.prototype.setState = function(state) {
        //TODO;
    };

    Object.defineProperties(USMapViewModel.prototype, {
        properties: {
            get: function() {
                return [ /* TODO */ ];
            }
        }
    });

    return USMapViewModel;
});