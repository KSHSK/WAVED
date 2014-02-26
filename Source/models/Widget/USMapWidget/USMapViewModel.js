/*global define*/
define([
        'models/Property/Coloring/ColoringSelectionProperty',
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

        // TODO: Validation, etc
        this._coloring = undefined; // ColoringSelectionProperty

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