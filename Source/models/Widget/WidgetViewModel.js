/*global define*/
define([
        'jquery',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Property/BooleanProperty',
        'models/ComponentViewModel',
        'util/defined',
        'util/defaultValue',
        'util/createValidator'
    ], function(
        $,
        StringProperty,
        NumberProperty,
        BooleanProperty,
        ComponentViewModel,
        defined,
        defaultValue,
        createValidator) {
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
        heightOptions.validValue = createValidator({
            min: 1,
            max: 100
        });
        heightOptions.errorMessage = 'Value must be between 1 and 100';

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
        widthOptions.validValue =  createValidator({
            min: 1,
            max: 100
        });
        widthOptions.errorMessage = 'Value must be between 1 and 100';
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
        xOptions.validValue = createValidator({
            min: 0,
            max: 100
        });
        xOptions.errorMessage = 'Value must be between 0 and 100';
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
        yOptions.validValue =  createValidator({
            min: 0,
            max: 100
        });
        yOptions.errorMessage = 'Value must be between 0 and 100';
        this.y = new NumberProperty(yOptions);

        // TODO: These things for real
        this._subwidgetNames = defaultValue(state.subwidgets, []); // String[]
        this._elementNames = defaultValue(state.elements, []); // String[]
        this._boundData = defaultValue(state.boundData, []); // String[]
        this._availableElements = []; // ComponentRecord[]
    };

    WidgetViewModel.prototype = Object.create(ComponentViewModel.prototype);

    Object.defineProperties(WidgetViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name, this.x, this.y, this.width, this.height, this.visible, this.logGoogleAnalytics];
            }
        },
        boundData: {
            get: function() {
                return this._boundData;
            }
        },
        elementNames: {
            get: function() {
                return this._elementNames;
            }
        }
    });

    WidgetViewModel.prototype.getState = function() {
        var state = ComponentViewModel.prototype.getState.call(this);
        state['width'] = this.width.getState();
        state['height'] = this.height.getState();
        state['x'] = this.x.getState();
        state['y'] = this.y.getState();
        state['elementNames'] = this.elementNames;
        state['boundData'] = this.boundData;

        return state;
    };

    WidgetViewModel.prototype.setState = function() {
        // TODO
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

    WidgetViewModel.prototype.bindData = function(dataSet) {
        var name = dataSet.name;

        // Don't bind the same data twice.
        if (this._boundData.indexOf(name) === -1) {
            this._boundData.push(name);
            dataSet.incrementReferenceCount();
        }
    };

    WidgetViewModel.prototype.unbindData = function(dataSet) {
        var name = dataSet.name;

        // Only unbind if the data is bound.
        var index = this._boundData.indexOf(name);
        if (index > -1) {
            this._boundData.splice(index, 1);
            dataSet.decrementReferenceCount();
        }
    };

    return WidgetViewModel;
});