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

    var WidgetViewModel = function(options) {
        options = (defined(options)) ? options : {};
        var nameOptions;
        if (defined(options.name)) {
            nameOptions = {
                displayName: options.name.displayName,
                value: options.name.value
            };
        }
        else {
            nameOptions = {
                displayName: 'Name',
                value: ''
            };
        }
        nameOptions.isValidValue = function(value) {
            return value.match(new RegExp('^[a-zA-Z0-9_\\- ]+$')) && value.length > 0 && value.length < 51;
        };
        this.name = new StringProperty(nameOptions);

        var heightOptions;
        if (defined(options.height)) {
            heightOptions = {
                displayName: options.height.displayName,
                value: options.height.value
            };
        }
        else {
            heightOptions = {
                displayName: 'Height',
                value: 50
            };
        }
        heightOptions.isValidValue = function(value) {
            return value >= 0 && value <= 100;
        };
        this.height = new NumberProperty(heightOptions);

        var widthOptions;
        if (defined(options.width)) {
            widthOptions = {
                displayName: options.width.displayName,
                value: options.width.value
            };
        }
        else {
            widthOptions = {
                displayName: 'Width',
                value: 50
            };
        }
        widthOptions.isValidValue = function(value) {
            return value >= 0 && value <= 100;
        };
        this.width = new NumberProperty(widthOptions);

        var xOptions;
        if (defined(options.x)) {
            xOptions = {
                displayName: options.x.displayName,
                value: options.x.value
            };
        }
        else {
            xOptions = {
                displayName: 'X',
                value: 0
            };
        }
        xOptions.isValidValue = function(value) {
            return value >= 0 && value <= 100;
        };
        this.x = new NumberProperty(xOptions);

        var yOptions;
        if (defined(options.y)) {
            yOptions = {
                displayName: options.y.displayName,
                value: options.y.value
            };
        }
        else {
            yOptions = {
                displayName: 'Y',
                value: 0
            };
        }
        yOptions.isValidValue = function(value) {
            return value >= 0 && value <= 100;
        };
        this.y = new NumberProperty(yOptions);

        var visibleOptions;
        if (defined(options.visible)) {
            visibleOptions = {
                displayName: options.visible.displayName,
                value: options.visible.value
            };
        }
        else {
            visibleOptions = {
                displayName: 'Visible',
                value: true
            };
        }
        this.visible = new BooleanProperty(visibleOptions);

        var gaOptions;
        if (defined(options.logGoogleAnalytics)) {
            gaOptions = {
                displayName: options.logGoogleAnalytics.displayName,
                value: options.logGoogleAnalytics.value
            };
        }
        else {
            gaOptions = {
                displayName: 'Log Google Analytics',
                value: false
            };
        }
        this.logGoogleAnalytics = new BooleanProperty(gaOptions);

        this._parent = defaultValue(options.parent, undefined);
        this._subwidgetNames = defaultValue(options.subwidgets, []);
        this._elementNames = defaultValue(options.elements, []);
        this._boundData = defaultValue(options.boundData, []);
        this._triggers = [];
    };

    Object.defineProperties(WidgetViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.width, this.height, this.visible, this.logGoogleAnalytics];
            }
        }
    });

    WidgetViewModel.prototype.setState = function(){
        //TODO
    };

    WidgetViewModel.prototype.getState = function() {
        //TODO
        return {};
    };

    WidgetViewModel.prototype.addElement = function(elementName) {
        //TODO
    };

    WidgetViewModel.prototype.removeElement = function(element) {
        //TODO
    };

    WidgetViewModel.prototype.addSubwidget = function(name) {
        //TODO
    };

    WidgetViewModel.prototype.removeSubwidget = function(name) {
        //TODO
    };

    WidgetViewModel.prototype.getAvailableElements = function() {
        //TODO
    };

    WidgetViewModel.prototype.bindData = function(name) {
        //TODO
    };

    WidgetViewModel.prototype.unbindData = function(name) {
        //TODO
    };

    return WidgetViewModel;
});