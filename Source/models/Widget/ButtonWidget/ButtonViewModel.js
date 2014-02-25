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

    var ButtonViewModel = function(options) {
        options = (defined(options)) ? options : {};
        var hasHeight = defined(options.height);
        var hasWidth = defined(options.width);
        WidgetViewModel.call(this, options);
        if (defined(options.label)) {
            this.label = new StringProperty(options.label);
        }
        else {
            var displayName = 'Label';
            this.label = new StringProperty({
                displayName: displayName,
                value: '',
                isValidValue: function(value) {
                    return value.length > 0 && value.length < 50;
                }
            });
        }
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
                return [this.name, this.label, this.x, this.y, this.width, this.height, this.visible,
                this.logGoogleAnalytics];
            }
        }
    });

    return ButtonViewModel;
});