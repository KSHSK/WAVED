/*global define*/
define([
        'models/Widget',
        'models/Property',
        'models/PropertyType/TextPropertyType',
        'util/defined',
        'knockout'
    ],function(
        Widget,
        Property,
        TextPropertyType,
        defined,
        ko){
    'use strict';

    var ButtonWidgetViewModel = function(options) {
        options = (defined(options)) ? options : {};
        var hasHeight = defined(options.height);
        var hasWidth = defined(options.width);
        Widget.call(this, options);
        if (defined(options.label)) {
            this.label = options.label;
        } else {
            var displayName = 'Label';
            this.label = new Property({
                displayName: displayName,
                value: '',
                propertyType: TextPropertyType,
                isValidValue: function(value) {
                    return typeof value === 'string' &&
                        value.length > 0 && value.length < 50;
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

    ButtonWidgetViewModel.prototype = new Widget({name:''});
    ButtonWidgetViewModel.prototype.constructor = ButtonWidgetViewModel;

    Object.defineProperties(ButtonWidgetViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.label, this.x, this.y, this.height,
                       this.width, this.visible, this.logGoogleAnalytics];
            }
        }
    });


    return ButtonWidgetViewModel;
});