/*global define*/
define([
        'jquery',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Property/BooleanProperty',
        'util/defined',
        'util/defaultValue'
    ], function(
        $,
        StringProperty,
        NumberProperty,
        BooleanProperty,
        defined,
        defaultValue) {
    'use strict';

    var Widget = function(options){
        options = (defined(options)) ? options : {};
        if (defined(options.name)) {
            this.name = options.name;
        } else {
            this.name = new StringProperty({
                displayName: 'Name',
                value: '',
                isValidValue: function(value) {
                    return value.match(new RegExp('^[a-zA-Z0-9_\\- ]+$')) &&
                        value.length > 0 && value.length < 51;
                }
            });
        }
        if (defined(options.height)) {
            this.height = options.height;
        } else {
            this.height = new NumberProperty({
                displayName: 'Height',
                value: 50,
                isValidValue: function(value) {
                    return value >= 0 && value <= 100;
                }
            });
        }
        if (defined(options.width)) {
            this.width = options.width;
        } else {
            this.width = new NumberProperty({
                displayName: 'Width',
                value: 50,
                isValidValue: function(value) {
                    return value >= 0 && value <= 100;
                }
            });
        }
        if (defined(options.x)) {
            this.x = options.x;
        } else {
            this.x = new NumberProperty({
                displayName: 'X',
                value: 0,
                isValidValue: function(value) {
                    return value >= 0 && value <= 100;
                }
            });
        }
        if (defined(options.y)) {
            this.y= options.y;
        } else {
            this.y = new NumberProperty({
                displayName: 'Y',
                value: 0,
                isValidValue: function(value) {
                    return value >= 0 && value <= 100;
                }
            });
        }
        if (defined(options.visible)) {
            this.visible = options.visible;
        } else {
            this.visible = new BooleanProperty({
                displayName: 'Visible',
                value: true
            });
        }
        if (defined(options.logGoogleAnalytics)) {
            this.logGoogleAnalytics = options.logGoogleAnalytics;
        } else {
            this.logGoogleAnalytics = new BooleanProperty({
                displayName: 'Log Google Analytics',
                value: false
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

    /*TODO: Missing functions*/

    return Widget;
});