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
        WidgetViewModel.call(this, state);

        // TODO: Validation, etc
        this.text = state.text; // StringProperty

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
                return [ this.text, this._name, this.x, this.y,
                         this.width, this.height, this.visible, this.logGoogleAnalytics ];
            }
        }
    });

    return TextBlockViewModel;
});