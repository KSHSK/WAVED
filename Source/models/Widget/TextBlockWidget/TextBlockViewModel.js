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

    var TextBlockViewModel = function(state) {
        state = (defined(state)) ? state : {};

        WidgetViewModel.call(this, state);

        ko.track(this);
    };

    TextBlockViewModel.prototype = Object.create(WidgetViewModel.prototype);

    TextBlockViewModel.prototype.getState = function() {
        //TODO;
    };

    TextBlockViewModel.prototype.setState = function(state) {
        //TODO;
    };

    Object.defineProperties(TextBlockViewModel.prototype, {
        properties: {
            get: function() {
                return [ /* TODO */ ];
            }
        }
    });

    return TextBlockViewModel;
});