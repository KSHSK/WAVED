/*global define*/
define([
        'models/Element/ElementViewModel',
        'models/Property/StringProperty',
        'util/defined',
        'knockout'
    ],function(
        ElementViewModel,
        StringProperty,
        defined,
        ko){
    'use strict';

    var TooltipViewModel = function(state) {
        state = (defined(state)) ? state : {};
        var hasText = defined(state.text);

        var textOptions;
        if (defined(state.text)) {
            textOptions = {
                displayName: state.text.displayName,
                value: state.text.value
            };
        }
        else {
            var displayName = 'Text';
            textOptions = {
                displayName: displayName,
                value: ''
            };
        }
        textOptions.isValidValue = function(value) {
            return; // TODO: Add validation here if necessary
        };

        this.text = new StringProperty(textOptions);

        ElementViewModel.call(this, state);

        ko.track(this);
    };

    TooltipViewModel.prototype = Object.create(ElementViewModel.prototype);

    TooltipViewModel.prototype.getState = function() {
        //TODO;
    };

    TooltipViewModel.prototype.setState = function(state) {
        //TODO;
    };

    Object.defineProperties(TooltipViewModel.prototype, {
        properties: {
            get: function() {
                return [ this._name, this.visible, this.logGoogleAnalytics, this.text ];
            }
        }
    });

    return TooltipViewModel;
});