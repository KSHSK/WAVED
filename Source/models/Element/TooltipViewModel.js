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

    var TooltipViewModel = function(options) {
        options = (defined(options)) ? options : {};
        var hasText = defined(options.text);

        var textOptions;
        if (defined(options.text)) {
            textOptions = {
                displayName: options.text.displayName,
                value: options.text.value
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

        ElementViewModel.call(this, options);

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
                return [this.text];
            }
        }
    });

    return TooltipViewModel;
});