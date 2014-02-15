/*global define*/
define([
        'jquery',
        'models/Property',
        'models/TextPropertyType',
        'models/NumberPropertyType',
        'models/BooleanPropertyType',
        'util/defined',
        'util/defaultValue'
    ], function(
        $,
        Property,
        TextPropertyType,
        NumberPropertyType,
        BooleanPropertyType,
        defined,
        defaultValue) {
    'use strict';

    var Widget = function(options){
        options = (defined(options)) ? options : {};
        if (defined(options.name)) {
            this.name = options.name;
        } else {
            this.name = new Property({
                displayName: 'Name',
                value: '',
                propertyType: TextPropertyType,
                isValidValue: function(value) {
                    return typeof value === 'string' &&
                        value.match(new RegExp('^[a-zA-Z0-9_\\- ]+$')) &&
                        value.length > 0 && value.length < 51;
                }
            });
        }
        if (defined(options.height)) {
            this.height = options.height;
        } else {
            this.height = new Property({
                displayName: 'Height',
                value: 50,
                propertyType: NumberPropertyType,
                isValidValue: function(value) {
                    return typeof value === 'number' &&
                        value >= 0 && value <= 100;
                }
            });
        }
        if (defined(options.width)) {
            this.width = options.width;
        } else {
            this.width = new Property({
                displayName: 'Width',
                value: 50,
                propertyType: NumberPropertyType,
                isValidValue: function(value) {
                    return typeof value === 'number' &&
                        value >= 0 && value <= 100;
                }
            });
        }
        if (defined(options.x)) {
            this.x = options.x;
        } else {
            this.x = new Property({
                displayName: 'X',
                value: 0,
                propertyType: NumberPropertyType,
                isValidValue: function(value) {
                    return typeof value === 'number' &&
                        value >= 0 && value <= 100;
                }
            });
        }
        if (defined(options.y)) {
            this.y= options.y;
        } else {
            this.y = new Property({
                displayName: 'Y',
                value: 0,
                propertyType: NumberPropertyType,
                isValidValue: function(value) {
                    return typeof value === 'number' &&
                        value >= 0 && value <= 100;
                }
            });
        }
        if (defined(options.visible)) {
            this.visible = options.visible;
        } else {
            this.visible = new Property({
                displayName: 'Visible',
                value: true,
                propertyType: BooleanPropertyType,
                isValidValue: function(value) {
                    return typeof value === 'boolean';
                }
            });
        }
        if (defined(options.logGoogleAnalytics)) {
            this.logGoogleAnalytics = options.logGoogleAnalytics;
        } else {
            this.logGoogleAnalytics = new Property({
                displayName: 'Log Google Analytics',
                value: false,
                propertyType: BooleanPropertyType,
                isValidValue: function(value) {
                    return typeof value === 'boolean';
                }
            });
        }

        this._parent = defaultValue(options.parent, undefined);
        this._subwidgets = defaultValue(options.subwidgets, []);
        this._elements = defaultValue(options.elements, []);
        this._boundData = defaultValue(options.boundData, []);
        this._triggers = [];
    };

    Widget.prototype.getProperties = function() {
        return [this.name, this.x, this.y, this.height, this.width, this.visible, this.logGoogleAnalytics];
    };

    return Widget;
});