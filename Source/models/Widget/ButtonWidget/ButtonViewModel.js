/*global define*/
define([
        'models/Widget/WidgetViewModel',
        'models/Property/StringProperty',
        'util/defined',
        'knockout'
    ],function(
        WidgetViewModel,
        StringProperty,
        defined,
        ko){
    'use strict';

    var ButtonViewModel = function(state) {
        state = (defined(state)) ? state : {};
        var hasHeight = defined(state.height);
        var hasWidth = defined(state.width);
        WidgetViewModel.call(this, state);

        var labelOptions;
        if (defined(state.label)) {
            labelOptions = {
                displayName: state.label.displayName,
                value: state.label.value
            };
        }
        else {
            var displayName = 'Label';
            labelOptions = {
                displayName: displayName,
                value: ''
            };
        }
        labelOptions.isValidValue = function(value) {
            return value.length > 0 && value.length < 50;
        };

        this.label = new StringProperty(labelOptions);

        if (!hasHeight) {
            this.height.value = 5;
        }
        if (!hasWidth) {
            this.width.value = 10;
        }

        ko.track(this);
    };

    ButtonViewModel.prototype = Object.create(WidgetViewModel.prototype);

    ButtonViewModel.prototype.getState = function() {
        //TODO;
    };

    ButtonViewModel.prototype.setState = function(state) {
        //TODO;
    };

    Object.defineProperties(ButtonViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name, this.label, this.x, this.y, this.width, this.height, this.visible,
                this.logGoogleAnalytics];
            }
        }
    });

    return ButtonViewModel;
});