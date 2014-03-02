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
        ComponentViewModel.call(this, state);

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
        this.height = new NumberProperty(heightOptions);

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
        this.width = new NumberProperty(widthOptions);

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
        this.x = new NumberProperty(xOptions);

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
        this.y = new NumberProperty(yOptions);

        // TODO: These things for real
        this._subwidgetNames = defaultValue(state.subwidgets, []);
        this._elementNames = defaultValue(state.elements, []);
        this._boundData = defaultValue(state.boundData, []);
        this._availableElements = []; // ComponentRecord[]
    };

    Object.defineProperties(WidgetViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name, this.x, this.y, this.width, this.height, this.visible, this.logGoogleAnalytics];
            }
        }
    });

    WidgetViewModel.prototype.setState = function() {
        // TODO
    };

    WidgetViewModel.prototype.getState = function() {
        // TODO
        return {};
    };

    WidgetViewModel.prototype.addElement = function(elementName) {
        // TODO
    };

    WidgetViewModel.prototype.removeElement = function(element) {
        // TODO
    };

    WidgetViewModel.prototype.addSubwidget = function(name) {
        // TODO
    };

    WidgetViewModel.prototype.removeSubwidget = function(name) {
        // TODO
    };

    WidgetViewModel.prototype.getAvailableElements = function() {
        // TODO
    };

    WidgetViewModel.prototype.bindData = function(name) {
        // TODO
    };

    WidgetViewModel.prototype.unbindData = function(name) {
        // TODO
    };

    WidgetViewModel.prototype = Object.create(ComponentViewModel.prototype);

    return WidgetViewModel;
});