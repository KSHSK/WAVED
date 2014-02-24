/*global define*/
define([
        'models/WidgetViewModel',
        'models/Property/StringProperty',
        'util/defined',
        'knockout'
    ],function(
        WidgetViewModel,
        StringProperty,
        defined,
        ko){
    'use strict';

    var ButtonWidgetViewModel = function(options) {
        options = (defined(options)) ? options : {};
        var hasHeight = defined(options.height);
        var hasWidth = defined(options.width);
        WidgetViewModel.call(this, options);
        if (defined(options.label)) {
            this.label = options.label;
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

    ButtonWidgetViewModel.prototype = Object.create(WidgetViewModel.prototype);

    Object.defineProperties(ButtonWidgetViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.label, this.x, this.y, this.height, this.width, this.visible,
                this.logGoogleAnalytics];
            }
        }
    });

    return ButtonWidgetViewModel;
});