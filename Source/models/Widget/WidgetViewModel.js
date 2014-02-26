/*global define*/
define([
        'jquery',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Property/BooleanProperty',
        'models/ComponentViewModel',
        'util/defined',
        'util/defaultValue'
    ], function(
        $,
        StringProperty,
        NumberProperty,
        BooleanProperty,
        ComponentViewModel,
        defined,
        defaultValue) {
    'use strict';

    var WidgetViewModel = function(state) {
        state = (defined(state)) ? state : {};
        var nameOptions;
        if (defined(state.name)) {
            nameOptions = {
                displayName: state.name.displayName,
                value: state.name.value
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
        this._name = new StringProperty(nameOptions);

        var heightOptions;
        if (defined(state.height)) {
            heightOptions = {
                displayName: state.height.displayName,
                value: state.height.value
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
        this._height = new NumberProperty(heightOptions);

        var widthOptions;
        if (defined(state.width)) {
            widthOptions = {
                displayName: state.width.displayName,
                value: state.width.value
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
        this._width = new NumberProperty(widthOptions);

        var xOptions;
        if (defined(state.x)) {
            xOptions = {
                displayName: state.x.displayName,
                value: state.x.value
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
        this._x = new NumberProperty(xOptions);

        var yOptions;
        if (defined(state.y)) {
            yOptions = {
                displayName: state.y.displayName,
                value: state.y.value
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
        this._y = new NumberProperty(yOptions);

        var visibleOptions;
        if (defined(state.visible)) {
            visibleOptions = {
                displayName: state.visible.displayName,
                value: state.visible.value
            };
        }
        else {
            visibleOptions = {
                displayName: 'Visible',
                value: true
            };
        }
        this._visible = new BooleanProperty(visibleOptions);

        var gaOptions;
        if (defined(state.logGoogleAnalytics)) {
            gaOptions = {
                displayName: state.logGoogleAnalytics.displayName,
                value: state.logGoogleAnalytics.value
            };
        }
        else {
            gaOptions = {
                displayName: 'Log Google Analytics',
                value: false
            };
        }
        this._logGoogleAnalytics = new BooleanProperty(gaOptions);

        this._parent = defaultValue(state.parent, undefined);
        this._subwidgetNames = defaultValue(state.subwidgets, []);
        this._elementNames = defaultValue(state.elements, []);
        this._boundData = defaultValue(state.boundData, []);
        this._triggers = [];
    };

    Object.defineProperties(WidgetViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name, this._x, this._y, this._width, this._height, this._visible, this._logGoogleAnalytics];
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

    WidgetViewModel.prototype = Object.create(ComponentViewModel.prototype);

    return WidgetViewModel;
});